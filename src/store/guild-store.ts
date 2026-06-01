import { create } from "zustand";
import { persist } from "zustand/middleware";

type GuildStore = {
  selectedGuildId: string | null;
  setSelectedGuildId: (guildId: string | null) => void;
  clearSelectedGuild: () => void;
};

export const useGuildStore = create<GuildStore>()(
  persist(
    (set) => ({
      selectedGuildId: null,
      setSelectedGuildId: (selectedGuildId) => set({ selectedGuildId }),
      clearSelectedGuild: () => set({ selectedGuildId: null }),
    }),
    { name: "kat-selected-guild" },
  ),
);
