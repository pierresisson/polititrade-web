# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev      # Start development server (localhost:3000)
bun build    # Production build
bun start    # Start production server
bun lint     # Run ESLint
```

**Package manager**: Bun

## Supabase

**Project**: polititrade (ref: `ccudiuoemukctisvdgcm`) - West EU (Ireland)

```bash
supabase link --project-ref ccudiuoemukctisvdgcm  # Link project
supabase db push                                   # Push migrations
supabase gen types typescript --local > lib/database.types.ts  # Generate types
```

**Packages**: `@supabase/supabase-js`, `@supabase/ssr`

**Env vars** (in `.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Architecture

**PolitiTrades** - Web app tracking insider trades from politicians and executives. See `product.md` for full product vision.

### Tech Stack
- **Next.js 16** with App Router and React Server Components (RSC)
- **React 19** with TypeScript strict mode
- **Tailwind CSS v4** with CSS variables for theming
- **shadcn/ui** (radix-nova style) - components in `components/ui/`
- **Supabase** - Backend (PostgreSQL + Auth)
- **Recharts** - All charts/graphs via `components/ui/chart.tsx` wrapper
- **Lucide React** - Icon library

### Project Structure
```
app/              # Next.js App Router pages and layouts
components/       # React components
  ui/             # shadcn/ui components
lib/
  utils.ts        # cn() helper for Tailwind class merging
```

### Key Patterns

**Import alias**: Use `@/` for root imports (e.g., `@/components/ui/button`)

**Class merging**: Use `cn()` from `@/lib/utils` for conditional Tailwind classes:
```tsx
import { cn } from "@/lib/utils"
cn("base-class", condition && "conditional-class")
```

**Adding shadcn components**:
```bash
bunx shadcn@latest add <component-name>
```

**RSC by default**: Components are Server Components unless marked with `"use client"` directive.

**Fonts**: Fraunces (display/headings) + Inter (body/UI) via Next.js font optimization (CSS variables `--font-fraunces`, `--font-inter`).

## Design System PolitiTrades

Centralized design tokens in `lib/theme.ts`. All colors defined in `app/globals.css` CSS variables.

### Color Palette

| Token | Light Mode | Usage |
|-------|------------|-------|
| `--background` | `#FAF7F0` | Page background (warm ecru) |
| `--foreground` | `#1F1E1A` | Primary text |
| `--card` | `#FFFFFF` | Card surfaces |
| `--primary` | `#4F46E5` | Indigo - primary actions |
| `--secondary` | `#FFFCF6` | Light ecru surface |
| `--muted-foreground` | `#6B6A63` | Secondary text |
| `--accent` | `#FEF3C7` | Amber highlight |
| `--border` | `#E8E5DD` | Subtle borders |
| `--chart-1` to `--chart-5` | Indigo, Violet, Cyan, Amber, Emerald | Data visualization |
| `--success` | `#10B981` | Positive/buy indicators |
| `--destructive` | `#EF4444` | Negative/sell indicators |

### Typography

- **Display/Headings**: `font-display` (Fraunces) - serif, elegant
- **Body/UI**: `font-body` (Inter) - sans-serif, readable

### Rules

1. **Zero hardcoded colors** - Use CSS variables or Tailwind semantic classes
2. **shadcn/ui only** - All components from `components/ui/`
3. **Consistent spacing** - Use Tailwind spacing scale
4. **Semantic colors** - `text-foreground`, `bg-card`, `border-border`, etc.
5. **All charts use Recharts** via `components/ui/chart.tsx` (`ChartContainer`, `ChartTooltipContent`, `ChartLegendContent`) — no custom SVG/canvas charts
6. **Chart colors exclusively via tokens** — `theme.ts` chart tokens / CSS variables (`--chart-1` to `--chart-5`, `--chart-grid`, `--chart-text`)
7. **Reduced motion support mandatory** — use `useChart().reducedMotion` to set `isAnimationActive={false}` on all Recharts elements

### Landing Page Components

```
components/landing/
├── header.tsx          # Sticky nav + CTAs
├── hero.tsx            # H1 + search + preview card
├── live-feed.tsx       # Transaction table (client)
├── top-politicians.tsx # Politician cards grid
├── value-props.tsx     # Feature cards
├── pricing.tsx         # 3 pricing plans
├── trust-section.tsx   # Data sources
├── faq.tsx             # Accordion (client)
└── footer.tsx          # Links + disclaimer
```

## Skills Reference

Agent skills in `.agents/skills/` - consult when working on related tasks.

| Skill | Use For | Path |
|-------|---------|------|
| **supabase-postgres-best-practices** | Queries, indexes, RLS, schema design, connection pooling, monitoring | `.agents/skills/supabase-postgres-best-practices/` |
| **next-best-practices** | RSC boundaries, async patterns, hydration errors, metadata, image/font optimization, route handlers | `.agents/skills/next-best-practices/` |
| **vercel-react-best-practices** | 57 rules: waterfalls, bundle size, server perf, rerenders, JS optimization | `.agents/skills/vercel-react-best-practices/` |
| **ui-ux-pro-max** | Design systems, color palettes, typography, styles (glassmorphism, etc.), accessibility | `.agents/skills/ui-ux-pro-max/` |
| **find-skills** | Discover and install new skills via `npx skills find <query>` | `.agents/skills/find-skills/` |

### Quick Commands

```bash
# UI/UX design system generation
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "fintech dashboard" --design-system

# Search specific domain (style, color, typography, ux, chart)
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "glassmorphism" --domain style

# Find new skills
npx skills find <query>
```
