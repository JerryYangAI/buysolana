export function PageHero({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-2xl border border-white/12 bg-white/[0.03] p-6 sm:p-8">
      <h1 className="text-3xl font-semibold text-zinc-100">{title}</h1>
      <p className="mt-3 max-w-3xl text-zinc-300">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
