"use client";

import { useMemo, useState } from "react";
import {
  type ApiEnvelopeError,
  type PaymentStatus,
  useCancelPaymentMutation,
  useCreatePaymentMutation,
  useCreateRefundMutation,
  useGetRefundsByPaymentIdQuery,
  useListPaymentsQuery,
  useUpdatePaymentStatusMutation,
  useUpdateRefundStatusMutation,
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
  const { data: payments = [], isLoading, isError } = useListPaymentsQuery(
    isAdmin ? { all: true } : undefined,
  );
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");
  const { data: refunds = [] } = useGetRefundsByPaymentIdQuery(selectedPaymentId, {
    skip: !selectedPaymentId,
  });
  const [createPayment, { isLoading: creatingPayment }] = useCreatePaymentMutation();
  const [updatePaymentStatus, { isLoading: updatingPaymentStatus }] =
    useUpdatePaymentStatusMutation();
  const [cancelPayment, { isLoading: cancellingPayment }] = useCancelPaymentMutation();
  const [createRefund, { isLoading: creatingRefund }] = useCreateRefundMutation();
  const [updateRefundStatus, { isLoading: updatingRefundStatus }] =
    useUpdateRefundStatusMutation();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [newPayment, setNewPayment] = useState({
    bookingId: "",
    amount: 0,
    currency: "USD",
    paymentMethod: "CARD",
  });
  const [newRefund, setNewRefund] = useState({
    paymentId: "",
    refundAmount: 0,
    refundReason: "",
  });

  const PAYMENT_STATUS: PaymentStatus[] = [
    "PENDING",
    "PROCESSING",
    "SUCCESS",
    "FAILED",
    "CANCELLED",
    "REFUNDED",
  ];
  const REFUND_STATUS = ["REQUESTED", "APPROVED", "REJECTED", "COMPLETED"];

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
          Payments
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Live payment service data.</p>
        {isLoading ? <p className="mt-2 text-sm text-zinc-600">Loading payments...</p> : null}
        {isError ? <p className="mt-2 text-sm text-red-600">Failed to load payments.</p> : null}
        {paymentError ? <p className="mt-2 text-sm text-red-600">{paymentError}</p> : null}

        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          <input
            placeholder="Booking ID"
            value={newPayment.bookingId}
            onChange={(e) => setNewPayment((p) => ({ ...p, bookingId: e.target.value }))}
            className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            type="number"
            placeholder="Amount"
            value={newPayment.amount}
            onChange={(e) => setNewPayment((p) => ({ ...p, amount: Number(e.target.value) }))}
            className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            placeholder="Currency"
            value={newPayment.currency}
            onChange={(e) => setNewPayment((p) => ({ ...p, currency: e.target.value }))}
            className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            placeholder="Method"
            value={newPayment.paymentMethod}
            onChange={(e) => setNewPayment((p) => ({ ...p, paymentMethod: e.target.value }))}
            className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            type="button"
            disabled={creatingPayment}
            onClick={async () => {
              try {
                setPaymentError(null);
                await createPayment(newPayment).unwrap();
                setNewPayment((p) => ({ ...p, bookingId: "", amount: 0 }));
              } catch (error) {
                setPaymentError(parseError(error, "Failed to create payment."));
              }
            }}
            className="h-10 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {creatingPayment ? "Creating..." : "Create payment"}
          </button>
        </div>

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
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">{payment.userId ?? "—"}</td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                    {money(payment.amount, payment.currency)}
                  </td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">{payment.paymentMethod}</td>
                  <td className="px-2 py-3">
                    <select
                      value={payment.status}
                      disabled={!isAdmin || updatingPaymentStatus}
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
                      {PAYMENT_STATUS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                    {payment.transactionReference ?? "N/A"}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPaymentId(payment.paymentId);
                          setNewRefund((prev) => ({ ...prev, paymentId: payment.paymentId }));
                        }}
                        className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                      >
                        Refunds
                      </button>
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

        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          <input
            placeholder="Payment ID"
            value={newRefund.paymentId}
            onChange={(e) => setNewRefund((r) => ({ ...r, paymentId: e.target.value }))}
            className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            type="number"
            placeholder="Refund amount"
            value={newRefund.refundAmount}
            onChange={(e) =>
              setNewRefund((r) => ({ ...r, refundAmount: Number(e.target.value) }))
            }
            className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            placeholder="Reason"
            value={newRefund.refundReason}
            onChange={(e) => setNewRefund((r) => ({ ...r, refundReason: e.target.value }))}
            className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            type="button"
            disabled={creatingRefund}
            onClick={async () => {
              try {
                setRefundError(null);
                await createRefund(newRefund).unwrap();
                setSelectedPaymentId(newRefund.paymentId);
              } catch (error) {
                setRefundError(parseError(error, "Failed to create refund."));
              }
            }}
            className="h-10 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {creatingRefund ? "Submitting..." : "Request refund"}
          </button>
        </div>

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
                <th className="px-2 py-2 text-right">Actions</th>
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
                  <td className="px-2 py-3">
                    <select
                      value={refund.refundStatus}
                      disabled={!isAdmin || updatingRefundStatus}
                      onChange={async (e) => {
                        try {
                          setRefundError(null);
                          await updateRefundStatus({
                            refundId: refund.refundId,
                            status: e.target.value,
                          }).unwrap();
                        } catch (error) {
                          setRefundError(parseError(error, "Failed to update refund status."));
                        }
                      }}
                      className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    >
                      {REFUND_STATUS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-3 text-right text-xs text-zinc-500">
                    {refund.createdAt ? new Date(refund.createdAt).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </div>
    </RequireRole>
  );
}
