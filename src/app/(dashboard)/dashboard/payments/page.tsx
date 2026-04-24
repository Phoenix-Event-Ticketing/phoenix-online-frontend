"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type ApiUser,
  type ApiEnvelopeError,
  type BookingRecord,
  type PaymentStatus,
  useBatchUsersMutation,
  useCancelPaymentMutation,
  useCompletePaymentMutation,
  useCreateRefundMutation,
  useGetBookingsByCustomerEmailQuery,
  useListBookingsQuery,
  useListPaymentsQuery,
  useListRefundsQuery,
  useStartBookingPaymentMutation,
  useUpdatePaymentStatusMutation,
} from "@/store/api";
import { RequireRole } from "@/components/dashboard/RequireRole";
import { useAppSelector } from "@/store/hooks";

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export default function DashboardPaymentsPage() {
  const user = useAppSelector((s) => s.session.user);
  const isAdmin = !!user?.roles?.includes("ADMIN");
  const isUser = !!user?.roles?.includes("USER");
  const { data: payments = [], isLoading, isError } = useListPaymentsQuery(
    isAdmin ? { all: true } : undefined,
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      pollingInterval: 5000,
    },
  );
  const {
    data: allBookings = [],
    isLoading: isLoadingBookingsAll,
    isError: isErrorBookingsAll,
  } = useListBookingsQuery(undefined, { skip: !isAdmin });
  const {
    data: ownBookings = [],
    isLoading: isLoadingBookingsOwn,
    isError: isErrorBookingsOwn,
  } = useGetBookingsByCustomerEmailQuery(user?.email ?? "", {
    skip: isAdmin || !user?.email,
  });
  const bookings = isAdmin ? allBookings : ownBookings;
  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.bookingStatus === "AWAITING_PAYMENT"),
    [bookings],
  );
  const isLoadingBookings = isAdmin ? isLoadingBookingsAll : isLoadingBookingsOwn;
  const isErrorBookings = isAdmin ? isErrorBookingsAll : isErrorBookingsOwn;
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");
  const { data: refunds = [] } = useListRefundsQuery(isAdmin ? { all: true } : undefined);
  const [updatePaymentStatus, { isLoading: updatingPaymentStatus }] =
    useUpdatePaymentStatusMutation();
  const [cancelPayment, { isLoading: cancellingPayment }] = useCancelPaymentMutation();
  const [startBookingPayment, { isLoading: startingBookingPayment }] = useStartBookingPaymentMutation();
  const [completePayment, { isLoading: completingPayment }] = useCompletePaymentMutation();
  const [createRefund, { isLoading: creatingRefund }] = useCreateRefundMutation();
  const [batchUsers] = useBatchUsersMutation();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Record<string, ApiUser>>({});
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showPayBookingModal, setShowPayBookingModal] = useState(false);
  const [bookingToPay, setBookingToPay] = useState<BookingRecord | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "CARD" | "BANK_TRANSFER" | "WALLET"
  >("CARD");
  const [refundDraft, setRefundDraft] = useState({
    paymentId: "",
    refundAmount: 0,
    refundReason: "",
  });

  const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
    PENDING: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SUCCESS", "FAILED"],
    SUCCESS: ["REFUNDED"],
    FAILED: [],
    CANCELLED: [],
    REFUNDED: [],
  };
  function parseError(error: unknown, fallback: string) {
    const candidate = error as ApiEnvelopeError;
    const message = candidate?.data?.error?.message;
    return message || fallback;
  }

  const totalPayments = useMemo(
    () => payments.reduce((sum, p) => sum + p.amount, 0),
    [payments],
  );
  const totalRefunds = useMemo(
    () => refunds.reduce((sum, r) => sum + r.refundAmount, 0),
    [refunds],
  );
  const paymentUserIds = useMemo(
    () =>
      Array.from(
        new Set(
          payments
            .map((p) => p.userId)
            .filter((id): id is string => typeof id === "string" && id.trim().length > 0),
        ),
      ),
    [payments],
  );

  useEffect(() => {
    if (!paymentUserIds.length) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const users = await batchUsers({ user_ids: paymentUserIds }).unwrap();
        if (cancelled) return;
        const nextMap: Record<string, ApiUser> = {};
        for (const u of users) {
          if (u?.id) nextMap[u.id] = u;
        }
        setUserMap(nextMap);
      } catch {
        if (!cancelled) setUserMap({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paymentUserIds, batchUsers]);

  return (
    <RequireRole tab="payments">
      <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Payments</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            {payments.length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total paid</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            {money(totalPayments, "USD")}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total refunds</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            {money(totalRefunds, "USD")}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Awaiting-payment bookings
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Start payment from here. Card and wallet are completed immediately, bank transfers stay
          pending for approval.
        </p>
        {isLoadingBookings ? (
          <p className="mt-2 text-sm text-zinc-600">Loading bookings...</p>
        ) : null}
        {isErrorBookings ? (
          <p className="mt-2 text-sm text-red-600">Failed to load bookings.</p>
        ) : null}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-2 py-2">Booking ID</th>
                <th className="px-2 py-2">Event ID</th>
                <th className="px-2 py-2">Amount</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingBookings.map((booking) => (
                <tr key={booking.bookingId} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="px-2 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {booking.bookingId}
                  </td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">{booking.eventId}</td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                    {money(booking.totalAmount, "LKR")}
                  </td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">{booking.bookingStatus}</td>
                  <td className="px-2 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentMethod("CARD");
                        setBookingToPay(booking);
                        setPaymentError(null);
                        setShowPayBookingModal(true);
                      }}
                      className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                    >
                      Pay
                    </button>
                  </td>
                </tr>
              ))}
              {!pendingBookings.length ? (
                <tr>
                  <td colSpan={5} className="px-2 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                    No bookings awaiting payment.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Payments
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Live payment service data.</p>
        {isLoading ? <p className="mt-2 text-sm text-zinc-600">Loading payments...</p> : null}
        {isError ? <p className="mt-2 text-sm text-red-600">Failed to load payments.</p> : null}
        {paymentError ? <p className="mt-2 text-sm text-red-600">{paymentError}</p> : null}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-2 py-2">ID</th>
                <th className="px-2 py-2">Booking ID</th>
                <th className="px-2 py-2">User ID</th>
                <th className="px-2 py-2">Amount</th>
                <th className="px-2 py-2">Method</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Transaction Ref</th>
                <th className="px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.paymentId} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="px-2 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {payment.paymentId}
                  </td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">{payment.bookingId}</td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                    {payment.userId ? (
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                          {(paymentUserIds.length ? userMap[payment.userId] : undefined)?.name ||
                            payment.userId}
                        </p>
                        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {payment.userId}
                        </p>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                    {money(payment.amount, payment.currency)}
                  </td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">{payment.paymentMethod}</td>
                  <td className="px-2 py-3">
                    {(() => {
                      const allowedNext = PAYMENT_TRANSITIONS[payment.status] ?? [];
                      const statusOptions: PaymentStatus[] = [payment.status, ...allowedNext];
                      if (!isAdmin) {
                        return (
                          <span className="inline-flex rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                            {payment.status}
                          </span>
                        );
                      }
                      return (
                    <select
                      value={payment.status}
                      disabled={updatingPaymentStatus || allowedNext.length === 0}
                      onChange={async (e) => {
                        try {
                          setPaymentError(null);
                          await updatePaymentStatus({
                            id: payment.paymentId,
                            status: e.target.value as PaymentStatus,
                          }).unwrap();
                        } catch (error) {
                          setPaymentError(parseError(error, "Failed to update payment status."));
                        }
                      }}
                      className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-800 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                      );
                    })()}
                  </td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                    {payment.transactionReference ?? "N/A"}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {isUser &&
                      (payment.status === "SUCCESS" ||
                        payment.status === "FAILED" ||
                        payment.status === "CANCELLED") ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPaymentId(payment.paymentId);
                            setRefundError(null);
                            setRefundDraft({
                              paymentId: payment.paymentId,
                              refundAmount: payment.amount,
                              refundReason: "",
                            });
                            setShowRefundModal(true);
                          }}
                          className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                        >
                          Refund
                        </button>
                      ) : null}
                      {((payment.status === "PENDING" && (isAdmin || isUser)) ||
                        (payment.status === "PROCESSING" && isAdmin)) ? (
                        <button
                          type="button"
                          disabled={cancellingPayment}
                          onClick={async () => {
                            try {
                              setPaymentError(null);
                              await cancelPayment(payment.paymentId).unwrap();
                            } catch (error) {
                              setPaymentError(parseError(error, "Failed to cancel payment."));
                            }
                          }}
                          className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Refunds
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Refund history for selected payment.
        </p>
        {refundError ? <p className="mt-2 text-sm text-red-600">{refundError}</p> : null}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-2 py-2">Refund ID</th>
                <th className="px-2 py-2">Payment ID</th>
                <th className="px-2 py-2">User ID</th>
                <th className="px-2 py-2">Refund Amount</th>
                <th className="px-2 py-2">Reason</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2 text-right">Created</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((refund) => (
                <tr key={refund.refundId} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="px-2 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {refund.refundId}
                  </td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">{refund.paymentId}</td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">{refund.userId ?? "—"}</td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                    {money(refund.refundAmount, "USD")}
                  </td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">{refund.refundReason}</td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                    {refund.refundStatus}
                  </td>
                  <td className="px-2 py-3 text-right text-xs text-zinc-500">
                    {refund.createdAt ? new Date(refund.createdAt).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
              {!refunds.length ? (
                <tr>
                  <td colSpan={7} className="px-2 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {selectedPaymentId
                      ? "No refunds for the selected payment yet."
                      : "No refunds found."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {showRefundModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Request refund"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !creatingRefund) {
              setShowRefundModal(false);
            }
          }}
        >
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Request refund
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Submit a refund request for payment <span className="font-medium">{refundDraft.paymentId}</span>.
            </p>

            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">Payment ID</span>
                <input
                  value={refundDraft.paymentId}
                  readOnly
                  className="mt-1 h-10 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">Refund amount</span>
                <input
                  type="number"
                  min={0}
                  value={refundDraft.refundAmount}
                  onChange={(e) =>
                    setRefundDraft((r) => ({ ...r, refundAmount: Number(e.target.value) }))
                  }
                  className="mt-1 h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">Reason</span>
                <input
                  value={refundDraft.refundReason}
                  onChange={(e) => setRefundDraft((r) => ({ ...r, refundReason: e.target.value }))}
                  placeholder="Customer requested cancellation"
                  className="mt-1 h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                disabled={creatingRefund}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={creatingRefund || !isUser || !refundDraft.paymentId || refundDraft.refundAmount <= 0}
                onClick={async () => {
                  try {
                    setRefundError(null);
                    await createRefund(refundDraft).unwrap();
                    setSelectedPaymentId(refundDraft.paymentId);
                    setShowRefundModal(false);
                  } catch (error) {
                    setRefundError(parseError(error, "Failed to create refund."));
                  }
                }}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {creatingRefund ? "Submitting..." : "Submit refund"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showPayBookingModal && bookingToPay ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Pay booking"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !startingBookingPayment && !completingPayment) {
              setShowPayBookingModal(false);
            }
          }}
        >
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Complete payment</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Booking <span className="font-medium">{bookingToPay.bookingId}</span>
            </p>
            <div className="mt-4 space-y-2">
              {[
                { value: "CARD", label: "Card (instant confirm)" },
                { value: "WALLET", label: "Digital wallet (instant confirm)" },
                { value: "BANK_TRANSFER", label: "Bank transfer (awaiting approval)" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                >
                  <span className="text-zinc-800 dark:text-zinc-200">{option.label}</span>
                  <input
                    type="radio"
                    name="dashboardPaymentMethod"
                    value={option.value}
                    checked={selectedPaymentMethod === option.value}
                    onChange={() =>
                      setSelectedPaymentMethod(option.value as "CARD" | "BANK_TRANSFER" | "WALLET")
                    }
                    disabled={startingBookingPayment || completingPayment}
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Total</p>
              <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {money(bookingToPay.totalAmount, "LKR")}
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPayBookingModal(false)}
                disabled={startingBookingPayment || completingPayment}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={startingBookingPayment || completingPayment}
                onClick={async () => {
                  try {
                    setPaymentError(null);
                    const paymentSession = await startBookingPayment({
                      bookingId: bookingToPay.bookingId,
                      paymentMethod: selectedPaymentMethod,
                    }).unwrap();
                    if (selectedPaymentMethod === "BANK_TRANSFER") {
                      setShowPayBookingModal(false);
                      return;
                    }
                    await completePayment({
                      id: paymentSession.paymentReferenceId,
                      status: "SUCCESS",
                      paymentMethod: selectedPaymentMethod,
                    }).unwrap();
                    setShowPayBookingModal(false);
                  } catch (error) {
                    setPaymentError(parseError(error, "Failed to process booking payment."));
                  }
                }}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {startingBookingPayment || completingPayment ? "Processing..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      </div>
    </RequireRole>
  );
}
