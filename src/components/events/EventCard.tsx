import Link from "next/link";
import { formatEventDateTime, formatLkr, type EventSummary } from "@/lib/events";

function bannerSrc(event: EventSummary) {
  if (event.bannerUrl) return event.bannerUrl;
  return `https://picsum.photos/seed/${encodeURIComponent(event.eventId)}/1200/600`;
}

function locationText(event: EventSummary) {
  return [event.venue, event.city].filter(Boolean).join(", ");
}

function statusStyles(status: EventSummary["status"]) {
  switch (status) {
    case "PUBLISHED":
      return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200";
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200";
    case "DRAFT":
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200";
  }
}

export function EventCard({
  event,
  href,
  variant = "card",
  showStatus = true,
}: {
  event: EventSummary;
  href?: string;
  variant?: "card" | "list" | "home";
  showStatus?: boolean;
}) {
  const location = locationText(event);
  const meta = [event.category, location].filter(Boolean).join(" • ");

  const content =
    variant === "home" ? (
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
        <div className="relative aspect-4/3 w-full bg-zinc-100 dark:bg-zinc-900">
          <img
            src={bannerSrc(event)}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          {event.category ? (
            <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-zinc-950/90 px-2 py-0.5 text-xs font-medium text-white backdrop-blur dark:bg-zinc-50/90 dark:text-zinc-950">
              {event.category}
            </span>
          ) : null}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {href ? (
                <Link
                  href={href}
                  className="block truncate text-base font-semibold tracking-tight text-zinc-950 hover:underline dark:text-zinc-50"
                >
                  {event.title}
                </Link>
              ) : (
                <h3 className="truncate text-base font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                  {event.title}
                </h3>
              )}

              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                {formatEventDateTime(event.eventDateTime)}
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {location || "—"}
              </p>

              {formatLkr(event.startingPriceLkr) ? (
                <p className="mt-3 text-base font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                  {formatLkr(event.startingPriceLkr)}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {href ? (
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <Link
              href={href}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              View details
            </Link>
          </div>
        ) : null}
      </div>
    ) : variant === "list" ? (
      <div className="group flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/40 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="relative hidden h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 sm:block">
            <img
              src={bannerSrc(event)}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="truncate text-base font-semibold tracking-tight text-zinc-950 group-hover:underline dark:text-zinc-50">
              {event.title}
            </h3>
            {showStatus ? (
              <span
                className={[
                  "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                  statusStyles(event.status),
                ].join(" ")}
              >
                {event.status}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            {meta || "—"}
          </p>
          {event.description ? (
            <p className="mt-1 line-clamp-1 text-sm text-zinc-600 dark:text-zinc-400">
              {event.description}
            </p>
          ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-row flex-wrap items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-center">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {formatEventDateTime(event.eventDateTime)}
          </p>
          {event.organizerName ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              by {event.organizerName}
            </p>
          ) : null}
        </div>
      </div>
    ) : (
      <div className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
        <div className="relative h-36 w-full bg-zinc-100 dark:bg-zinc-900">
          <img
            src={bannerSrc(event)}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {formatEventDateTime(event.eventDateTime)}
            </p>
            <h3 className="mt-1 truncate text-base font-semibold tracking-tight text-zinc-950 group-hover:underline dark:text-zinc-50">
              {event.title}
            </h3>
          </div>

          {showStatus ? (
            <span
              className={[
                "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                statusStyles(event.status),
              ].join(" ")}
            >
              {event.status}
            </span>
          ) : null}
        </div>

        {event.description ? (
          <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {event.description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {meta || "—"}
          </p>
          {event.organizerName ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              by {event.organizerName}
            </p>
          ) : null}
        </div>
        </div>
      </div>
    );

  if (!href) return content;
  if (variant === "home") return content;
  return (
    <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-zinc-400/60 dark:focus:ring-zinc-600/60">
      {content}
    </Link>
  );
}

