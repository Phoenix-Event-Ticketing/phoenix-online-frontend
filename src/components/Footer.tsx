export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            Phoenix Events
          </p>
          <p>Demo event tracking system.</p>
          <p>© {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
