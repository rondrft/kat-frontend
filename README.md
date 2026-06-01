# Kat — Discord Bot

Frontend para el bot de Discord **Kat**: landing premium + arquitectura modular lista para escalar (Next.js 15, TypeScript).

## Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** (estado cliente)
- **TanStack Query** (estado servidor / cache)
- **Axios** (cliente HTTP → Spring Boot)
- **Zod** + **React Hook Form**
- **Husky** + **lint-staged** + **Prettier** + **ESLint**

## Inicio rápido

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Script            | Descripción                |
| ----------------- | -------------------------- |
| `npm run dev`     | Servidor de desarrollo     |
| `npm run build`   | Build de producción        |
| `npm run lint`    | ESLint                     |
| `npm run format`  | Prettier write             |
| `npm run typecheck` | Verificación TypeScript |

## Estructura

```
src/
├── app/              # Rutas Next.js (App Router)
├── components/       # UI compartida (ui, layout, landing, providers)
├── features/         # Módulos por dominio (auth, …)
├── api/              # Cliente HTTP + endpoints
├── services/         # Llamadas API tipadas
├── hooks/            # Hooks globales reutilizables
├── store/            # Zustand stores
├── lib/              # Infraestructura (env, errors, query, i18n)
├── config/           # Configuración estática
├── types/            # Tipos compartidos
└── utils/            # Utilidades puras
```

Ver [docs/CONVENTIONS.md](./docs/CONVENTIONS.md) para convenciones de naming y escalado.

## Backend (Spring Boot)

Configura `NEXT_PUBLIC_API_URL` apuntando a tu API REST. El cliente Axios en `src/api/client.ts` incluye:

- Interceptores de auth (Bearer token)
- Mapeo de errores Spring Boot → `AppError`
- `withCredentials` para cookies de sesión futuras

## Discord OAuth2

El flujo OAuth se inicia en el frontend pero el **intercambio de código** debe hacerse en Spring Boot (`/auth/discord/callback`). Ver `src/config/discord.ts` y `src/app/auth/callback/page.tsx`.

## Licencia

Privado — proyecto Kat.
