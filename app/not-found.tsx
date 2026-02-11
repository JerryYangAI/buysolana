export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-xs tracking-[0.14em] text-zinc-400 uppercase">404</p>
      <h1 className="text-2xl font-semibold text-zinc-100">Page not found</h1>
      <p className="text-sm text-zinc-400">Check the URL or switch language in the header.</p>
    </main>
  );
}
