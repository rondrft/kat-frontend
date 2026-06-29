export function BackgroundEffects() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-background" />

      <div className="gradient-mesh absolute inset-0 opacity-70" />

      <div className="anim-bg-blob-main absolute left-1/2 top-1/2 h-[130vh] w-[130vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[200px]" />

      <div className="anim-bg-blob-fade-a absolute left-[25%] top-[15%] h-[100vh] w-[100vw] rounded-full bg-cyan-400/15 blur-[180px]" />

      <div className="anim-bg-blob-fade-b absolute right-[5%] bottom-[5%] h-[90vh] w-[90vw] rounded-full bg-indigo-500/15 blur-[200px]" />

      <div
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.15]"
        style={{
          backgroundImage: [
            "linear-gradient(to right, hsl(var(--border) / 0.4) 1px, transparent 1px)",
            "linear-gradient(to bottom, hsl(var(--border) / 0.4) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 75%)",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_72%)]" />
    </div>
  );
}
