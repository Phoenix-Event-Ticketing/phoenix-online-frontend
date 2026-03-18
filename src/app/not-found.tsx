import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        Page not found
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        404
      </h1>
      <p className="mt-3 text-base text-zinc-700 dark:text-zinc-300">
        The page you’re looking for doesn’t exist or was moved.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        Go to Home
      </Link>
    </div>
  );
}
