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

## Architecture

**PolitiTrades** - Web app tracking insider trades from politicians and executives. See `product.md` for full product vision.

### Tech Stack
- **Next.js 16** with App Router and React Server Components (RSC)
- **React 19** with TypeScript strict mode
- **Tailwind CSS v4** with CSS variables for theming
- **shadcn/ui** (radix-nova style) - components in `components/ui/`
- **Supabase** - Backend (PostgreSQL + Auth)
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

**Fonts**: Geist Sans and Geist Mono via Next.js font optimization (CSS variables `--font-geist-sans`, `--font-geist-mono`).
