# Arquitectura — Kat Dashboard

## Principios

1. **Feature-first** — La lógica de negocio vive en `features/<dominio>/`, no en `pages`.
2. **Separación de capas** — UI → hooks → services → api client.
3. **Single source of truth** — Rutas, env, query keys centralizados en `config/`.
4. **Fail fast** — Env validado con Zod al arranque; errores tipados (`ApiError`, etc.).

## Flujo de datos

```
Page (Server/Client)
  └── Feature Component
        └── Hook (useGuilds) ──► TanStack Query
              └── Service (guildService)
                    └── apiClient (Axios) ──► Spring Boot REST API
```

**Zustand** se usa solo para estado de UI global (sidebar, locale) y sesión de auth persistida.

## Por qué esta estructura

### `features/` vs `components/`

- **`components/`**: piezas reutilizables sin lógica de dominio (Button, Sidebar, ErrorBoundary).
- **`features/`**: módulos acoplados al negocio (guilds, auth, settings). Cada feature puede tener `components/`, `hooks/`, `schemas/`.

Esto permite que un equipo trabaje en `features/moderation/` sin tocar `features/guilds/`.

### `services/` vs `api/`

- **`api/`**: infraestructura HTTP (cliente, interceptors, paths).
- **`services/`**: operaciones de dominio (`getAll`, `updateSettings`). Facilita tests y mocks.

### `config/query-keys.ts`

Factory de keys para invalidación precisa:

```ts
queryClient.invalidateQueries({ queryKey: queryKeys.guilds.all });
```

### Preparación OAuth Discord

- `DiscordLoginButton` genera URL OAuth con `state` anti-CSRF.
- `/auth/callback` intercambia `code` vía `authService.exchangeCode` → Spring Boot.
- `middleware.ts` listo para proteger `/dashboard/*`.

### i18n futuro

`lib/i18n.ts` expone `createTranslator`. Migración recomendada: **next-intl** manteniendo keys actuales (`nav.dashboard`, etc.).

## Escalabilidad

### Nuevo módulo (ej. moderación)

```
src/features/moderation/
├── components/
├── hooks/
├── schemas/
└── index.ts (opcional)
```

1. Tipos en `types/moderation.ts`
2. Endpoints en `api/endpoints.ts`
3. `moderation.service.ts`
4. Query keys en `config/query-keys.ts`
5. Página en `app/(dashboard)/dashboard/moderation/page.tsx`

### Equipos grandes

- **Code owners** por carpeta `features/*`
- **Lazy loading**: `dynamic(() => import('@/features/...'))` en páginas pesadas
- **Route groups** `(dashboard)`, `(marketing)` para layouts distintos

## Performance

- Server Components por defecto en `page.tsx` donde no hay interactividad
- `"use client"` solo en componentes con estado/efectos
- `staleTime` / `refetchInterval` configurados por hook
- Imágenes Discord vía `next/image` con `remotePatterns`
- Animaciones CSS ligeras (`animate-fade-in`), sin librerías pesadas

## Seguridad

- Secrets solo en servidor (sin `NEXT_PUBLIC_`)
- Headers de seguridad en `next.config.ts`
- Validación OAuth `state`
- Token en `localStorage` (considerar httpOnly cookies cuando el backend lo soporte)
