"use client";

import { useParams } from "next/navigation";
import { WelcomeSection } from "@/features/dashboard/components/sections/welcome-section";

export default function WelcomePage() {
  const params = useParams<{ guildId: string }>();

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <WelcomeSection guildId={params.guildId} />
      </div>
    </main>
  );
}
