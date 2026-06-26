# Kat Frontend — Claude Context

## Project

React dashboard for **Kat**, a Discord bot targeting **thousands of servers and millions of users**. Part of a 4-service system:

| Repo | Path | Role |
|---|---|---|
| **kat-frontend** | `/home/ron/Documents/kat-frontend` | Next.js dashboard (this repo) |
| **kat-bot** | `/home/ron/Documents/kat-bot` | Discord bot (Spring Boot 4.0.6, Java 21, JDA 5.3.0) |
| **kat-backend** | — | Spring Boot REST API |
| **kat-infra** | — | Infrastructure |

**Last work session (Jun 2026):** Landing page polish (bigger text, visible background smoke, footer links moved to bottom-right) + dark mode by default.

## Tech stack

Next.js 15 (App Router, Turbopack), React 19, TypeScript 5.7, Tailwind CSS 3.4, Zustand 5, TanStack Query 5, Axios, Zod, Framer Motion, shadcn/ui (Radix), Lucide icons, next-themes. Husky + lint-staged.

## Directory structure

```
src/
├── api/            Axios client, 401 interceptor, endpoint URL factory
├── app/            Next.js App Router pages (landing, auth, dashboard/*, payment, terms…)
├── components/     Reusable UI (landing/, layout/, providers/, ui/)
├── config/         Centralized config: site.ts, themes.ts, api.ts, discord.ts
├── features/       Domain modules (auth, dashboard, guilds, moderation, leveling, works… each has components/ hooks/ types/)
├── hooks/          Shared hooks (useDebounce, useMediaQuery, useMounted)
├── lib/            Utils (i18n/, errors.ts, query-client.ts, utils.ts)
├── services/       Domain services (auth, guild, bot — wraps apiClient)
├── store/          Zustand stores (auth, guild, ui)
├── types/          Shared TS types
├── utils/          Normalizer functions, formatters, discord URL helpers
└── middleware.ts   Protects /dashboard/*, redirects to /auth/login
```

## Key files

| File | Role |
|---|---|
| `src/app/layout.tsx` | Root layout: fonts (Geist, Nunito), `<AppProviders>`, globals.css, `<html class="dark">` |
| `src/app/page.tsx` | Landing page (server component, renders `<BackgroundEffects>` + `<HeroSection>` + `<SiteHeader>`) |
| `src/components/landing/hero-section.tsx` | Landing hero: KAT watermark, katrunv2.png (center), bottom-left text, bottom-right footer links |
| `src/components/landing/background-effects.tsx` | Smoke blobs and floating particles behind the hero |
| `src/components/providers/theme-provider.tsx` | `next-themes` wrapper: `defaultTheme="dark"`, `enableSystem`, `storageKey="kat-theme"` |
| `src/components/providers/app-providers.tsx` | Provider hierarchy: Theme → BrandTheme → Query → AuthHydration → Tooltip → Locale |
| `src/config/site.ts` | Site name, title, description, URLs, social links |
| `src/config/themes.ts` | Theme options + brand presets (default/ocean/ember) |
| `src/config/discord.ts` | Discord OAuth URLs, bot invite URLs |
| `src/features/auth/` | Discord OAuth2 code grant flow. Zustand store persisted as `kat-auth` in localStorage |
| `src/features/dashboard/` | SPA-style dashboard with sidebar nav + glassmorphism panel. Section switching via Zustand |
| `src/api/client.ts` | Axios instance with 401 → `kat:unauthorized` event, typed error handling |
| `src/api/endpoints.ts` | All REST endpoint URL builders |
| `src/services/guild.service.ts` | All guild CRUD (settings, moderation, leveling, logging, works, etc.) |
| `src/store/auth-store.ts` | Auth session persisted to localStorage |
| `src/lib/query-client.ts` | TanStack Query defaults (staleTime: 60s, gcTime: 5min, retries: max 2, skip 4xx) |
| `src/lib/errors.ts` | `AppError` class with status/code/details |
| `src/middleware.ts` | Protects `/dashboard/*` by checking `kat-access-token` cookie |

## Conventions

- **Feature-first architecture:** each feature in `features/<name>/` with its own components/, hooks/, schemas/, types/, lib/
- **Strict unidirectional flow:** UI → hooks → services → apiClient → REST API
- **Imports via `@/` alias** (`@/components/ui/button`, `@/features/auth`)
- **shadcn/ui components** in `src/components/ui/`, style "new-york", baseColor "zinc"
- **`cn()` utility** (clsx + tailwind-merge) for className merging
- **All icons via `lucide-react`**
- **Animations via `framer-motion`**
- **State management via Zustand** (auth + guild persisted to localStorage)
- **Server data via TanStack Query** — never store API responses in Zustand
- **Zod for validation** at system boundaries (env vars, forms, callback params)
- **Naming:** folders kebab-case, components PascalCase, hooks `use*`, services `*.service.ts`, stores `*-store.ts`
- **Prettier:** semicolons on, singleQuotes off, tabWidth 2, trailingComma all, printWidth 88

## What was done this session

- **Background effects smoke** — bumped all opacities (clouds `/8→/20`, blobs `/8→/12–/20`, particles `0.8→1`)
- **Bottom-left text enlarged** — subtitle `text-base/sm:text-lg`, heading `text-3xl/sm:text-4xl/lg:text-5xl`, tagline `text-base/sm:text-lg`, buttons `h-12`/`min-w-[200px]`/`text-base`
- **Footer links moved** to bottom-right corner inline in HeroSection (removed SiteFooter from page)
- **Dark mode by default** — changed `defaultTheme="dark"`, removed `ResetThemeOnMount` (was forcing "light" on every page load), added `enableSystem`
- **Container/button sizes increased** — `max-w-lg→xl`, spacing bumped (`mb-5`, `mt-4`, `mt-7`)

## Previous sessions — kat-bot 100k guild production readiness

The **kat-bot** repo had a comprehensive audit and fix pass targeting **100k+ guilds and millions of users**. Key items addressed:

- **Scheduler pool size** fixed (`spring.task.scheduling.pool.size=4` — was default 1, causing starvation)
- **All 7 `@Scheduled` methods** wrapped in try/catch to prevent thread death
- **LevelingService.flushXpBuffer** — max 100 batches/cycle (was draining entire 1M buffer in one shot)
- **RecurringMessageService N+1** — batch `saveAll` instead of individual `save`
- **WorkButtonListener renounce** — try/finally ThreadLocal cleanup
- **DB indexes added** in ensureTable() (recurring_next, lotteries, user_reps, rep_history)
- **pendingXpBuffer trim** — O(n) random eviction instead of O(n log n) sort
- **GlobalPrefixListener ThreadLocals NOT cleared** — intentionally left for 30+ downstream listeners
- **Verdict: Safe to deploy**

For full kat-bot details, see `/home/ron/Documents/kat-bot/CLAUDE.md`.
