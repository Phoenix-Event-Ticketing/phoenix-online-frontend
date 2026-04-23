"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatEventDateTime, formatLkr } from "@/lib/events";
import {
  type EventApiError,
  type TicketType,
  useCreateInventoryMutation,
  useGetEventInventoryQuery,
  useGetEventQuery,
  useUpdateInventoryMutation,
} from "@/store/api";

const ticketTypeOptions = ["VIP", "STANDARD", "EARLY_BIRD"] as const;

export function DashboardInventoryEventClient({ eventId }: { eventId: string }) {
  const normalizedEventId = eventId.trim();
  const hasEventId = normalizedEventId.length > 0;
  const {
    data: event,
    isLoading: isLoadingEvent,
    isUninitialized: isEventUninitialized,
    isError: hasEventError,
    error: eventError,
    refetch: refetchEvent,
  } = useGetEventQuery(normalizedEventId, { skip: !hasEventId });
  const { data: inventory, isLoading, refetch } = useGetEventInventoryQuery(normalizedEventId, {
    skip: !hasEventId,
  });
  const [createInventory, { isLoading: isCreating }] = useCreateInventoryMutation();
  const [updateInventory, { isLoading: isUpdating }] = useUpdateInventoryMutation();
  const [ticketType, setTicketType] =
    useState<(typeof ticketTypeOptions)[number]>("VIP");
  const [priceLkr, setPriceLkr] = useState(0);
  const [ticketCount, setTicketCount] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const rates = useMemo(() => inventory?.items ?? [], [inventory]);

  if (!hasEventId) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Invalid event link.</p>
      </div>
    );
  }

  if (isEventUninitialized || isLoadingEvent) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading event...</p>
      </div>
    );
  }

  const eventStatus = Number((eventError as EventApiError | undefined)?.status);
  const isNotFoundError = hasEventError && eventStatus === 404;

  if (hasEventError && !isNotFoundError) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-red-600">Failed to load event details.</p>
        <button
          type="button"
          onClick={() => refetchEvent()}
          className="mt-3 inline-flex h-8 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Event not found.</p>
      </div>
    );
  }

  const location = [event.venue, event.city].filter(Boolean).join(", ");

  function toErrorMessage(error: unknown, fallback: string) {
    const candidate = error as EventApiError;
    if (typeof candidate?.data === "object" && candidate.data) {
      const message = (candidate.data as { error?: string; message?: string }).error
        ?? (candidate.data as { error?: string; message?: string }).message;
      if (message) return message;
    }
    if ("status" in (candidate ?? {}) && (candidate as { status?: number }).status === 403) {
      return "You do not have permission for this action.";
    }
    return fallback;
  }

  async function handleAddTickets() {
    if (!ticketCount || ticketCount < 1) return;
    if (!priceLkr || priceLkr < 1) return;
    setApiError(null);
    const existing = rates.find((row) => row.ticketType === ticketType);
    try {
      if (existing) {
        await updateInventory({
          inventoryId: existing.inventoryId,
          ticketType: ticketType as TicketType,
          price: priceLkr,
          totalQuantity: existing.totalQuantity + ticketCount,
        }).unwrap();
      } else {
        await createInventory({
          eventId: normalizedEventId,
          ticketType: ticketType as TicketType,
          price: priceLkr,
          totalQuantity: ticketCount,
        }).unwrap();
      }
      await refetch();
      setTicketCount(0);
      setPriceLkr(0);
      setIsAddOpen(false);
    } catch (error) {
      setApiError(toErrorMessage(error, "Could not update inventory."));
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              {event.title}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {formatEventDateTime(event.eventDateTime)} • {location || "—"}
            </p>
            {apiError ? <p className="mt-1 text-xs text-red-600">{apiError}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Add tickets
            </button>
            <Link
              href="/dashboard/inventory"
              className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
            >
              Back
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-5 bg-zinc-50 px-4 py-3 text-xs font-medium text-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300">
          <p>Ticket type</p>
          <p className="text-right">Price</p>
          <p className="text-right">Available</p>
          <p className="text-right">Hold</p>
          <p className="text-right">Sold</p>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {isLoading ? (
            <div className="px-4 py-5 text-sm text-zinc-600 dark:text-zinc-400">
              Loading inventory...
            </div>
          ) : rates.length ? (
            rates.map((r) => (
              <div key={r.inventoryId} className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {r.ticketType}
                </p>
                <p className="text-right text-zinc-900 dark:text-zinc-50">
                  {formatLkr(r.price) ?? `${r.price} LKR`}
                </p>
                <p className="text-right text-zinc-900 dark:text-zinc-50">
                  {r.availableQuantity}
                </p>
                <p className="text-right text-zinc-900 dark:text-zinc-50">
                  {r.heldQuantity}
                </p>
                <p className="text-right text-zinc-900 dark:text-zinc-50">
                  {r.soldQuantity}
                </p>
              </div>
            ))
          ) : (
            <div className="px-4 py-5 text-sm text-zinc-600 dark:text-zinc-400">
              No ticket types available for this event.
            </div>
          )}
        </div>
      </div>

      {isAddOpen ? (
        <>
          <button
            type="button"
            aria-label="Close add tickets modal"
            className="fixed inset-0 z-40 cursor-default bg-black/30"
            onClick={() => setIsAddOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[min(720px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Add tickets
            </h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Add tickets by type with price and count using inventory-service APIs.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="space-y-1">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Ticket type
                </span>
                <select
                  value={ticketType}
                  onChange={(e) =>
                    setTicketType(
                      e.target.value as (typeof ticketTypeOptions)[number],
                    )
                  }
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                >
                  {ticketTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Price (LKR)
                </span>
                <input
                  type="number"
                  min={0}
                  value={priceLkr}
                  onChange={(e) => setPriceLkr(Number(e.target.value))}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Ticket count
                </span>
                <input
                  type="number"
                  min={0}
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Number(e.target.value))}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddTickets}
                disabled={isCreating || isUpdating}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {isCreating || isUpdating ? "Saving..." : "Add"}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
