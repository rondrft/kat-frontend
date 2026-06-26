import { WelcomeSection } from "@/features/dashboard/components/sections/welcome-section";

export default async function WelcomePage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <WelcomeSection guildId={guildId} />
      </div>
    </main>
  );
}
