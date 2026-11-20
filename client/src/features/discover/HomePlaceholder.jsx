// Temporary home page at "/". The Discover page replaces it in task 10.9.
export default function HomePlaceholder() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center text-ink">
      <h1 className="font-lettering text-5xl font-bold">Toonverse</h1>
      <p className="mt-4 text-lg">Create and read webcomics. Coming soon.</p>
    </main>
  );
}
