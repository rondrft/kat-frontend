import type { Locale } from "./config";
import { commonEn, commonEs, commonPtBr, commonFr, commonDe, commonJa } from "./translations/common";
import { sectionsEn, sectionsEs, sectionsPtBr, sectionsFr, sectionsDe, sectionsJa } from "./translations/sections";
import { authEn, authEs, authPtBr, authFr, authDe, authJa } from "./translations/auth";
import { landingEn, landingEs, landingPtBr, landingFr, landingDe, landingJa } from "./translations/landing";
import { settingsEn, settingsEs, settingsPtBr, settingsFr, settingsDe, settingsJa } from "./translations/settings";
import { sidebarEn, sidebarEs, sidebarPtBr, sidebarFr, sidebarDe, sidebarJa } from "./translations/sidebar";
import { dashboardEn, dashboardEs, dashboardPtBr, dashboardFr, dashboardDe, dashboardJa } from "./translations/dashboard";
import { overviewEn, overviewEs, overviewPtBr, overviewFr, overviewDe, overviewJa } from "./translations/overview";
import { moderationEn, moderationEs, moderationPtBr, moderationFr, moderationDe, moderationJa } from "./translations/moderation";
import { logsEn, logsEs, logsPtBr, logsFr, logsDe, logsJa } from "./translations/logs";
import { activityEn, activityEs, activityPtBr, activityFr, activityDe, activityJa } from "./translations/activity";
import { welcomeEn, welcomeEs, welcomePtBr, welcomeFr, welcomeDe, welcomeJa } from "./translations/welcome";
import { premiumEn, premiumEs, premiumPtBr, premiumFr, premiumDe, premiumJa } from "./translations/premium";
import { statisticsEn, statisticsEs, statisticsPtBr, statisticsFr, statisticsDe, statisticsJa } from "./translations/statistics";
import { modalsEn, modalsEs, modalsPtBr, modalsFr, modalsDe, modalsJa } from "./translations/modals";

interface DictSchema {
  common: Record<string, string>;
  sections: Record<string, { label: string; title: string; description: string }>;
  auth: Record<string, string>;
  settings: Record<string, string>;
  sidebar: Record<string, string>;
  dashboard: { title: string; welcome: string; stats: Record<string, string> };
  overview: Record<string, unknown>;
  moderation: Record<string, unknown>;
  logs: Record<string, unknown>;
  activity: Record<string, unknown>;
  welcome: Record<string, unknown>;
  premium: Record<string, unknown>;
  statistics: Record<string, unknown>;
  modals: Record<string, unknown>;
  landing: Record<string, string>;
}

const es = {
  common: commonEs,
  sections: sectionsEs,
  auth: authEs,
  settings: settingsEs,
  sidebar: sidebarEs,
  dashboard: dashboardEs,
  overview: overviewEs,
  moderation: moderationEs,
  logs: logsEs,
  activity: activityEs,
  welcome: welcomeEs,
  premium: premiumEs,
  statistics: statisticsEs,
  modals: modalsEs,
  landing: landingEs,
} as const satisfies DictSchema;

export type Dictionary = typeof es;

const en = {
  common: commonEn,
  sections: sectionsEn,
  auth: authEn,
  settings: settingsEn,
  sidebar: sidebarEn,
  dashboard: dashboardEn,
  overview: overviewEn,
  moderation: moderationEn,
  logs: logsEn,
  activity: activityEn,
  welcome: welcomeEn,
  premium: premiumEn,
  statistics: statisticsEn,
  modals: modalsEn,
  landing: landingEn,
} as const satisfies DictSchema;

const ptBr = {
  common: commonPtBr,
  sections: sectionsPtBr,
  auth: authPtBr,
  settings: settingsPtBr,
  sidebar: sidebarPtBr,
  dashboard: dashboardPtBr,
  overview: overviewPtBr,
  moderation: moderationPtBr,
  logs: logsPtBr,
  activity: activityPtBr,
  welcome: welcomePtBr,
  premium: premiumPtBr,
  statistics: statisticsPtBr,
  modals: modalsPtBr,
  landing: landingPtBr,
} as const satisfies DictSchema;

const fr = {
  common: commonFr,
  sections: sectionsFr,
  auth: authFr,
  settings: settingsFr,
  sidebar: sidebarFr,
  dashboard: dashboardFr,
  overview: overviewFr,
  moderation: moderationFr,
  logs: logsFr,
  activity: activityFr,
  welcome: welcomeFr,
  premium: premiumFr,
  statistics: statisticsFr,
  modals: modalsFr,
  landing: landingFr,
} as const satisfies DictSchema;

const de = {
  common: commonDe,
  sections: sectionsDe,
  auth: authDe,
  settings: settingsDe,
  sidebar: sidebarDe,
  dashboard: dashboardDe,
  overview: overviewDe,
  moderation: moderationDe,
  logs: logsDe,
  activity: activityDe,
  welcome: welcomeDe,
  premium: premiumDe,
  statistics: statisticsDe,
  modals: modalsDe,
  landing: landingDe,
} as const satisfies DictSchema;

const ja = {
  common: commonJa,
  sections: sectionsJa,
  auth: authJa,
  settings: settingsJa,
  sidebar: sidebarJa,
  dashboard: dashboardJa,
  overview: overviewJa,
  moderation: moderationJa,
  logs: logsJa,
  activity: activityJa,
  welcome: welcomeJa,
  premium: premiumJa,
  statistics: statisticsJa,
  modals: modalsJa,
  landing: landingJa,
} as const satisfies DictSchema;

export const dictionaries = {
  en,
  es,
  "pt-BR": ptBr,
  fr,
  de,
  ja,
} as const;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] as unknown as Dictionary;
}
