import type { Locale } from "./config";

const es = {
  common: {
    loading: "Cargando…",
    error: "Algo salió mal",
    retry: "Reintentar",
    save: "Guardar",
    cancel: "Cancelar",
  },
  dashboard: {
    title: "Dashboard",
    welcome: "Bienvenido a Kat",
    stats: {
      guilds: "Servidores",
      users: "Usuarios",
      commands: "Comandos hoy",
    },
  },
  auth: {
    loginWithDiscord: "Iniciar sesión con Discord",
    logout: "Cerrar sesión",
  },
};

const en: Dictionary = {
  common: {
    loading: "Loading…",
    error: "Something went wrong",
    retry: "Retry",
    save: "Save",
    cancel: "Cancel",
  },
  dashboard: {
    title: "Dashboard",
    welcome: "Welcome to Kat",
    stats: {
      guilds: "Guilds",
      users: "Users",
      commands: "Commands today",
    },
  },
  auth: {
    loginWithDiscord: "Sign in with Discord",
    logout: "Sign out",
  },
};

export type Dictionary = typeof es;

export const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
