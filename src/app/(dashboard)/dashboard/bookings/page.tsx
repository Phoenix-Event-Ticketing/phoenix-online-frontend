"use client";

import { useMemo, useState } from "react";
import { formatEventDateTime, formatLkr } from "@/lib/events";
import {
  type ApiEnvelopeError,
  useCancelBookingMutation,
  useCompletePaymentMutation,
  useListBookingsQuery,
} from "@/store/api";

function bookingStatusStyles(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200";
    case "AWAITING_PAYMENT":
      return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200";
    case "FAILED":
    case "CANCELLED":
    case "EXPIRED":
      return "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200";
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200";
  }
}

function paymentStatusStyles(status: string) {
  switch (status) {
    case "SUCCESS":
      return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200";
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200";
    default:
      return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200";
  }
}

export default function DashboardBookingsPage() {
  const { data: bookings = [], isLoading, isError } = useListBookingsQuery();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  const [completePayment, { isLoading: isCompletingPayment }] = useCompletePaymentMutation();
  const [apiError, setApiError] = useState<string | null>(null);

  function parseError(error: unknown, fallback: string) {
    const candidate = error as ApiEnvelopeError;
    const message =
      typeof candidate?.data === "object" &&
      candidate?.data &&
      "message" in candidate.data
        ? String((candidate.data as { message?: string }).message ?? "")
        : "";
    return message || fallback;
  }

  const total = useMemo(
    () => bookings.reduce((sum, b) => sum + b.totalAmount, 0),
    [bookings],
  );
  const confirmed = useMemo(
    () => bookings.filter((b) => b.bookingStatus === "CONFIRMED").length,
    [bookings],
  );
  const awaiting = useMemo(
    () => bookings.filter((b) => b.bookingStatus === "AWAITING_PAYMENT").length,
    [bookings],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Booking dashboard
            </h2>
          </div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Awaiting payment: {awaiting}
          </p>
        </div>
        {isLoading ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Loading bookings...</p>
        ) : null}
        {isError ? <p className="mt-2 text-sm text-red-600">Failed to load bookings.</p> : null}
        {apiError ? <p className="mt-2 text-sm text-red-600">{apiError}</p> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Bookings</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            {bookings.length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Confirmed</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            {confirmed}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total value</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            {formatLkr(total) ?? `${total} LKR`}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="min-w-[1100px]">
        <div className="grid grid-cols-14 gap-x-3 bg-zinc-50 px-4 py-3 text-xs font-medium text-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300">
          <p className="col-span-2">Booking ID</p>
          <p className="col-span-2">Event</p>
          <p className="col-span-2">Customer</p>
          <p className="col-span-1 text-right">Qty</p>
          <p className="col-span-1 text-right">Amount</p>
          <p className="col-span-2">Booking status</p>
          <p className="col-span-1">Payment</p>
          <p className="col-span-1 text-right">Created</p>
          <p className="col-span-2 text-right">Actions</p>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {bookings.map((b) => (
            <div key={b.bookingId} className="grid grid-cols-14 items-center gap-x-3 px-4 py-3 text-sm">
              <div className="col-span-2 min-w-0">
                <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                  {b.bookingId}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {b.eventId}
                </p>
              </div>
              <p className="col-span-2 truncate text-zinc-700 dark:text-zinc-300">
                {b.eventId}
              </p>
              <div className="col-span-2 min-w-0">
                <p className="truncate text-zinc-900 dark:text-zinc-50">{b.userId}</p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {b.customerEmail}
                </p>
              </div>
              <p className="col-span-1 text-right text-zinc-900 dark:text-zinc-50">{b.quantity}</p>
              <p className="col-span-1 text-right text-zinc-900 dark:text-zinc-50">
                {formatLkr(b.totalAmount) ?? `${b.totalAmount} LKR`}
              </p>
              <div className="col-span-2">
                <select
                  value={b.bookingStatus}
                  disabled
                  className={[
                    "h-8 rounded-md border px-2 text-xs font-medium",
                    bookingStatusStyles(b.bookingStatus),
                  ].join(" ")}
                >
                  {[
                    "PENDING",
                    "AWAITING_PAYMENT",
                    "CONFIRMED",
                    "FAILED",
                    "CANCELLED",
                    "EXPIRED",
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <select
                  value={b.paymentStatus}
                  disabled
                  className={[
                    "h-8 rounded-md border px-2 text-xs font-medium",
                    paymentStatusStyles(b.paymentStatus),
                  ].join(" ")}
                >
                  {["PENDING", "SUCCESS", "FAILED"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <p className="col-span-1 text-right text-xs text-zinc-600 dark:text-zinc-400">
                {formatEventDateTime(b.createdAt)}
              </p>
              <div className="col-span-2 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  disabled={isCancelling || isCompletingPayment}
                  onClick={async () => {
                    try {
                      setApiError(null);
                      await cancelBooking(b.bookingId).unwrap();
                    } catch (error) {
                      setApiError(parseError(error, "Failed to cancel booking."));
                    }
                  }}
                  className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/20"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    isCancelling ||
                    isCompletingPayment ||
                    !b.paymentReferenceId ||
                    b.bookingStatus !== "AWAITING_PAYMENT"
                  }
                  onClick={async () => {
                    if (!b.paymentReferenceId) return;
                    try {
                      setApiError(null);
                      await completePayment({
                        id: b.paymentReferenceId,
                        status: "SUCCESS",
                      }).unwrap();
                    } catch (error) {
                      setApiError(parseError(error, "Failed to complete payment."));
                    }
                  }}
                  className="rounded-md border border-emerald-300 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-900/60 dark:text-emerald-200 dark:hover:bg-emerald-950/30"
                >
                  Complete
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}

