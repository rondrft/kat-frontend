# Convenciones — Kat Dashboard

## Naming

| Elemento        | Convención              | Ejemplo                    |
| --------------- | ----------------------- | -------------------------- |
| Carpetas        | kebab-case              | `guild-settings/`          |
| Componentes     | PascalCase              | `GuildList.tsx`            |
| Hooks           | camelCase + `use`       | `useGuilds.ts`             |
| Services        | camelCase + `.service`  | `guild.service.ts`         |
| Stores          | kebab-case + `-store`   | `auth-store.ts`            |
| Tipos           | PascalCase              | `Guild`, `AuthSession`     |
| Constantes      | SCREAMING_SNAKE o `as const` | `endpoints`, `siteConfig` |
| Query keys      | array readonly          | `["guilds", page]`         |

## Features (módulos)

Cada feature en `src/features/<nombre>/` contiene:

```
feature/
├── components/   # UI específica del dominio
├── hooks/        # React Query + lógica de feature
├── schemas/      # Zod schemas
└── index.ts      # API pública del módulo (barrel export)
```

**Regla:** otros módulos solo importan desde `@/features/<nombre>`, nunca rutas internas profundas.

## Capas (clean architecture frontend)

```
UI (components/features)
    ↓
Hooks (useGuilds, useAuth)
    ↓
Services (guildService)
    ↓
API Client (axios)
    ↓
Spring Boot REST API
```

- **No** llamar `apiClient` directamente desde componentes.
- **Sí** usar services + React Query hooks.

## Escalado

1. **Nueva feature:** crear carpeta en `features/`, exportar desde `index.ts`.
2. **Nueva ruta:** agregar bajo `app/(dashboard)/` y entrada en `config/navigation.ts`.
3. **Nuevo endpoint:** agregar en `api/endpoints.ts` + método en `services/`.
4. **i18n:** migrar `lib/i18n/dictionary.ts` a next-intl cuando haya 2+ idiomas en producción.
5. **Auth:** activar validación en `middleware.ts` cuando el backend emita JWT/cookie.

## Performance

- Server Components por defecto; `"use client"` solo donde haga falta.
- React Query con `staleTime` y sin `refetchOnWindowFocus` global.
- `next/image` para avatares Discord.
- Lazy load de features pesadas con `dynamic()` cuando crezcan.
