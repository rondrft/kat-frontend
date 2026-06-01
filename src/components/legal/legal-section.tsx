type LegalSectionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
};

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
