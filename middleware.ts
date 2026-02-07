import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { defaultLocale, locales, isValidLocale } from '@/lib/i18n'

/**
 * Detect preferred locale from cookie (explicit choice) or Accept-Language header.
 */
function detectLocale(request: NextRequest): string {
  // 1. Explicit user choice via cookie
  const cookie = request.cookies.get('NEXT_LOCALE')?.value
  if (cookie && isValidLocale(cookie)) return cookie

  // 2. Browser Accept-Language header
  const acceptLang = request.headers.get('Accept-Language')
  if (acceptLang) {
    // Parse e.g. "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7"
    const preferred = acceptLang
      .split(',')
      .map((part) => {
        const [lang, q] = part.trim().split(';q=')
        return { lang: lang.split('-')[0].toLowerCase(), q: q ? parseFloat(q) : 1 }
      })
      .sort((a, b) => b.q - a.q)
      .find((entry) => (locales as readonly string[]).includes(entry.lang))

    if (preferred) return preferred.lang
  }

  return defaultLocale
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Skip static files, _next, api, auth callback
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/callback') ||
    /\.(?:ico|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|css|js|map)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  // 2. Redirect 308: /en/... → /... (remove default locale prefix)
  if (firstSegment === defaultLocale) {
    const rest = segments.slice(1).join('/')
    const newPath = `/${rest}`
    const url = request.nextUrl.clone()
    url.pathname = newPath
    return NextResponse.redirect(url, 308)
  }

  // 3. Pass-through: /fr/... (non-default locale) — continue
  // 4. Detect preferred locale and redirect/rewrite accordingly
  let response: NextResponse

  if (firstSegment && isValidLocale(firstSegment)) {
    // Non-default locale path (e.g. /fr/...) — pass through
    response = NextResponse.next({ request })
  } else {
    // No locale prefix — detect preferred locale
    const preferred = detectLocale(request)

    if (preferred !== defaultLocale) {
      // Redirect to preferred locale (e.g. /fr/...)
      const url = request.nextUrl.clone()
      url.pathname = `/${preferred}${pathname === '/' ? '' : pathname}`
      return NextResponse.redirect(url, 307)
    }

    // Default locale — rewrite to /en/... internally
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}${pathname}`
    response = NextResponse.rewrite(url, { request })
  }

  // 5. Supabase session refresh — only for protected /app routes
  //    Public pages (landing, politicians, auth) skip the network call
  const resolvedPath = firstSegment && isValidLocale(firstSegment)
    ? '/' + segments.slice(1).join('/')
    : pathname
  const needsAuth = resolvedPath.startsWith('/app')

  if (needsAuth) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session cookie — getSession() only hits the network when
    // the JWT is actually expired, unlike getUser() which always does a
    // round-trip to the Supabase Auth server.  The real security-sensitive
    // validation (getUser) still runs inside getUserAccessLevel().
    await supabase.auth.getSession()
  }

  // 6. Store locale preference cookie
  const locale = firstSegment && isValidLocale(firstSegment) ? firstSegment : defaultLocale
  response.cookies.set('NEXT_LOCALE', locale, { path: '/', sameSite: 'lax' })

  return response
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
}
