"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getPersistedAccessToken } from "@/lib/auth-ui";
import { formatEventDateTime, formatLkr } from "@/lib/events";
import {
  useCreateBookingMutation,
  useGetEventInventoryAvailabilityQuery,
  useGetEventQuery,
  useStartBookingPaymentMutation,
} from "@/store/api";
import { useAppSelector } from "@/store/hooks";

export function PublicBookingClient({ eventId }: { eventId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((s) => s.session.user);
  const hasToken = Boolean(getPersistedAccessToken());
  const { data: event } = useGetEventQuery(eventId, { skip: !eventId });
  const { data: inventory } = useGetEventInventoryAvailabilityQuery(eventId, {
    skip: !eventId,
  });
  const rates = useMemo(
    () => inventory?.items ?? [],
    [inventory],
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [createBooking] = useCreateBookingMutation();
  const [startBookingPayment] = useStartBookingPaymentMutation();
  const [bookingError, setBookingError] = useState<string | null>(null);

  const firstAvailable = useMemo(() => {
    return rates.find((r) => r.availableQuantity > 0)?.ticketType ?? rates[0]?.ticketType ?? "";
  }, [rates]);

  const [ticketType, setTicketType] = useState<string>(firstAvailable);
  const selected = useMemo(
    () => rates.find((r) => r.ticketType === ticketType) ?? rates[0],
    [rates, ticketType],
  );

  const maxQty = Math.max(0, selected?.availableQuantity ?? 0);
  const [quantity, setQuantity] = useState<number>(Math.min(1, maxQty || 1));

  const clampedQty = Math.min(Math.max(quantity, 1), Math.max(1, maxQty || 1));
  const total =
    selected && typeof selected.price === "number"
      ? selected.price * clampedQty
      : undefined;

  if (!event) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Event not found.</p>
        <Link href="/events" className="mt-3 inline-block text-sm font-medium underline">
          Back to events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-linear-to-b from-zinc-950 to-zinc-900 text-white dark:border-zinc-800">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <nav className="text-xs text-white/70">
            <Link href="/events" className="hover:text-white">
              Events
            </Link>{" "}
            <span className="px-1">›</span>
            <Link href={`/events/${event.eventId}`} className="hover:text-white">
              {event.title}
            </Link>{" "}
            <span className="px-1">›</span>
            <span className="text-white/90">Booking</span>
          </nav>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Book tickets
          </h1>
          <p className="mt-1 text-sm text-white/80">{event.title}</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_360px] md:items-start">
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Select tickets
            </h2>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Ticket type
                </label>
                <div className="space-y-2">
                  {rates.length ? (
                    rates.map((r) => {
                      const disabled = r.availableQuantity <= 0;
                      const checked = ticketType === r.ticketType;
                      return (
                        <label
                          key={r.ticketType}
                          className={[
                            "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-3 text-sm",
                            checked
                              ? "border-zinc-900 dark:border-zinc-200"
                              : "border-zinc-200 dark:border-zinc-800",
                            disabled
                              ? "bg-zinc-50 text-zinc-500 dark:bg-zinc-900/30 dark:text-zinc-500"
                              : "bg-white text-zinc-900 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40",
                          ].join(" ")}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="ticketType"
                                value={r.ticketType}
                                checked={checked}
                                disabled={disabled}
                                onChange={() => {
                                  setTicketType(r.ticketType);
                                  const nextMax = Math.max(0, r.availableQuantity);
                                  setQuantity((q) => Math.min(Math.max(1, q), Math.max(1, nextMax || 1)));
                                }}
                              />
                              <span className="truncate font-medium">{r.ticketType}</span>
                            </div>
                            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                              {disabled ? "Sold out" : `${r.availableQuantity} available`}
                            </p>
                          </div>
                          <div className="shrink-0 font-semibold">
                            {formatLkr(r.price) ?? `${r.price} LKR`}
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      No ticket rates available yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Quantity
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
                    disabled={!selected || maxQty <= 0 || clampedQty <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={maxQty || 1}
                    value={clampedQty}
                    disabled={!selected || maxQty <= 0}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="h-10 w-24 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  />
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
                    disabled={!selected || maxQty <= 0 || clampedQty >= maxQty}
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  >
                    +
                  </button>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Max {maxQty || 0}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="md:sticky md:top-20">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex gap-3">
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                  {event.bannerUrl ? (
                    <img
                      src={event.bannerUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {formatEventDateTime(event.eventDateTime)}
                  </p>
                  <p className="mt-1 truncate text-xs text-zinc-600 dark:text-zinc-400">
                    {[event.venue, event.city].filter(Boolean).join(", ") || "—"}
                  </p>
                  {formatLkr(event.startingPriceLkr) ? (
                    <p className="mt-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      From {formatLkr(event.startingPriceLkr)}
                    </p>
                  ) : null}
                </div>
              </div>

              <hr className="my-4 border-zinc-200 dark:border-zinc-800" />

              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Summary
              </h2>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-zinc-600 dark:text-zinc-400">Ticket</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {selected?.ticketType ?? "—"}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-zinc-600 dark:text-zinc-400">Quantity</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {selected ? clampedQty : "—"}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-zinc-600 dark:text-zinc-400">Price</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {selected ? formatLkr(selected.price) ?? `${selected.price} LKR` : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Total
                </p>
                <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {typeof total === "number" ? formatLkr(total) : "—"}
                </p>
              </div>

              {bookingError ? (
                <p className="mt-3 text-sm text-red-600">{bookingError}</p>
              ) : null}
              {!user || !hasToken ? (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  Please{" "}
                  <Link
                    href={{ pathname, query: { auth: "signin" } }}
                    className="font-medium underline"
                  >
                    sign in
                  </Link>{" "}
                  to continue with booking.
                </p>
              ) : null}
              <button
                type="button"
                disabled={!selected || maxQty <= 0 || !user || !hasToken}
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                onClick={async () => {
                  if (!user || !hasToken) {
                    router.replace(`${pathname}?auth=signin`);
                    return;
                  }
                  if (!selected) return;
                  setBookingError(null);
                  setIsProcessing(true);
                  try {
                    const createdBooking = await createBooking({
                      eventId,
                      customerEmail: user.email,
                      ticketType: selected.ticketType,
                      quantity: clampedQty,
                      totalAmount: total ?? selected.price,
                      seat: "AUTO",
                      userId: user.id,
                    }).unwrap();
                    await startBookingPayment(createdBooking.bookingId).unwrap();
                  } catch {
                    setBookingError("Could not reserve tickets. Please try again.");
                  } finally {
                    setIsProcessing(false);
                  }
                }}
              >
                {isProcessing ? "Processing..." : "Continue"}
              </button>

              <Link
                href={`/events/${event.eventId}`}
                className="mt-3 block text-center text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
              >
                Back to details
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
