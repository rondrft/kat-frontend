import { ModerationSection } from "@/features/dashboard/components/sections/moderation-section";

export default async function ModerationPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <ModerationSection guildId={guildId} />
      </div>
    </main>
  );
}
