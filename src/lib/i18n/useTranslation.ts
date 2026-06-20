import { useUiStore } from "@/store/ui-store";
import { getDictionary } from "./dictionary";

export function useTranslation() {
  const locale = useUiStore((s) => s.locale);
  const t = getDictionary(locale);
  return t;
}
