# Supabase Google OAuth Setup Guide

## 1. Supabase Dashboard Configuration

1. Go to your Supabase project dashboard: **Authentication > Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials (Client ID + Client Secret — see step 2)
4. Under **Authentication > URL Configuration**, add these redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

## 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Set application type to **Web application**
6. Add authorized redirect URIs:
   - `https://ccudiuoemukctisvdgcm.supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**
8. Paste them into the Supabase dashboard Google provider settings (step 1)

### OAuth Consent Screen

1. Navigate to **APIs & Services > OAuth consent screen**
2. Set user type to **External**
3. Fill in app name, user support email, and developer contact
4. Add scopes: `email`, `profile`, `openid`
5. Add test users if in testing mode

## 3. Environment Variables

Create/update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ccudiuoemukctisvdgcm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Database Migration

Push the profiles table migration:

```bash
supabase link --project-ref ccudiuoemukctisvdgcm
supabase db push
```

This creates:
- `profiles` table with `id`, `full_name`, `avatar_url`, `is_premium`
- RLS policies (users can read/update own profile)
- Trigger to auto-create profile on user signup

## 5. Testing Checklist

- [ ] Click "Sign in" → redirects to Google OAuth consent screen
- [ ] After Google auth → callback exchanges code → redirects to `/{locale}` with active session
- [ ] Header shows avatar with user initials/photo + dropdown with name and email
- [ ] Click "Sign out" → session cleared, header shows guest buttons again
- [ ] Refresh page → session persists (middleware refreshes cookies)
- [ ] Navigate to `/{locale}/auth/error` → error page renders with i18n
- [ ] Test both `/en` and `/fr` locales for auth flow
- [ ] Verify profile row is created in `profiles` table after first sign-in

## 6. Troubleshooting

### Redirect URI Mismatch
- Ensure the redirect URI in Google Cloud Console matches **exactly**: `https://<project-ref>.supabase.co/auth/v1/callback`
- Check Supabase dashboard redirect URLs include your app's `/auth/callback` path

### Cookies Not Set
- Ensure `middleware.ts` is at the project root (not inside `app/`)
- Check that the middleware matcher isn't accidentally excluding your routes
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### Provider Not Enabled
- Verify Google provider is enabled in Supabase dashboard under **Authentication > Providers**
- Ensure Client ID and Client Secret are filled in

### Session Not Persisting
- The middleware must call `supabase.auth.getUser()` to refresh the session
- Check browser DevTools for Supabase auth cookies
- Ensure cookies are not being blocked by browser settings
