"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatEventDateTime } from "@/lib/events";
import {
  type EventApiError,
  type TicketType,
  useCreateInventoryMutation,
  useListEventsQuery,
} from "@/store/api";

const ticketTypeOptions = ["VIP", "STANDARD", "EARLY_BIRD"] as const;

export default function AddInventoryPage() {
  const { data: events = [], isLoading: isLoadingEvents, isError } = useListEventsQuery();
  const [createInventory, { isLoading: isSaving }] = useCreateInventoryMutation();
  const [eventId, setEventId] = useState("");
  const [ticketType, setTicketType] =
    useState<(typeof ticketTypeOptions)[number]>("VIP");
  const [price, setPrice] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedEvent = useMemo(
    () => events.find((event) => event.eventId === eventId),
    [events, eventId],
  );

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

  async function handleSubmit() {
    if (!eventId) return;
    if (!price || price < 1) return;
    if (!totalQuantity || totalQuantity < 1) return;

    setApiError(null);
    setIsSuccess(false);

    try {
      await createInventory({
        eventId,
        ticketType: ticketType as TicketType,
        price,
        totalQuantity,
      }).unwrap();
      setTotalQuantity(0);
      setPrice(0);
      setIsSuccess(true);
    } catch (error) {
      setApiError(toErrorMessage(error, "Could not add inventory."));
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Add inventory
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Create a ticket inventory record for an event.
            </p>
          </div>
          <Link
            href="/dashboard/inventory"
            className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
          >
            Back to inventory
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Event
            </span>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event.eventId} value={event.eventId}>
                  {event.title} ({event.eventId})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Ticket type
            </span>
            <select
              value={ticketType}
              onChange={(e) =>
                setTicketType(e.target.value as (typeof ticketTypeOptions)[number])
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
              min={1}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Total quantity
            </span>
            <input
              type="number"
              min={1}
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
            />
          </label>
        </div>

        {selectedEvent ? (
          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
            Selected event date: {formatEventDateTime(selectedEvent.eventDateTime)}
          </p>
        ) : null}
        {isLoadingEvents ? (
          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">Loading events...</p>
        ) : null}
        {isError ? <p className="mt-3 text-xs text-red-600">Failed to load events.</p> : null}
        {apiError ? <p className="mt-3 text-xs text-red-600">{apiError}</p> : null}
        {isSuccess ? (
          <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
            Inventory created successfully.
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isLoadingEvents || !events.length}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {isSaving ? "Saving..." : "Create inventory"}
          </button>
        </div>
      </div>
    </div>
  );
}
