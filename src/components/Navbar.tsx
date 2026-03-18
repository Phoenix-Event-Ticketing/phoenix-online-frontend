import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
        >
          Phoenix Events
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-zinc-700 sm:flex dark:text-zinc-300">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={{ pathname: "/", query: { auth: "signin" } }}
            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Sign in
          </Link>
          <Link
            href={{ pathname: "/", query: { auth: "signup" } }}
            className="hidden h-9 items-center justify-center rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 sm:inline-flex dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
