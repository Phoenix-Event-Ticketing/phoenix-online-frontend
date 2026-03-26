"use client";

import { Fragment, useMemo, useState } from "react";
import {
  mockPayments,
  mockRefunds,
  PAYMENT_STATUS,
  REFUND_STATUS,
  type PaymentRecord,
  type RefundRecord,
} from "@/lib/mock-payments";

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export default function DashboardPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([...mockPayments]);
  const [refunds, setRefunds] = useState<RefundRecord[]>([...mockRefunds]);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editingRefundId, setEditingRefundId] = useState<string | null>(null);

  const totalPayments = useMemo(
    () => payments.reduce((sum, p) => sum + p.amount, 0),
    [payments],
  );
  const totalRefunds = useMemo(
    () => refunds.reduce((sum, r) => sum + r.refundAmount, 0),
    [refunds],
  );

  return (
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
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Hardcoded sample data based on your payment model.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-2 py-2">Payment ID</th>
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
                <Fragment key={payment.paymentId}>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="px-2 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {payment.paymentId}
                    </td>
                    <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                      {payment.bookingId}
                    </td>
                    <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                      {payment.userId}
                    </td>
                    <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                      {money(payment.amount, payment.currency)}
                    </td>
                    <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-2 py-3">
                      <select
                        value={payment.status}
                        onChange={(e) => {
                          setPayments((prev) =>
                            prev.map((item) =>
                              item.paymentId === payment.paymentId
                                ? {
                                    ...item,
                                    status: e.target.value as PaymentRecord["status"],
                                  }
                                : item,
                            ),
                          );
                        }}
                        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                      >
                        {Object.values(PAYMENT_STATUS).map((status) => (
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
                          onClick={() =>
                            setEditingPaymentId((id) =>
                              id === payment.paymentId ? null : payment.paymentId,
                            )
                          }
                          className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                        >
                          {editingPaymentId === payment.paymentId ? "Cancel" : "Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPayments((prev) =>
                              prev.filter((item) => item.paymentId !== payment.paymentId),
                            )
                          }
                          className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingPaymentId === payment.paymentId ? (
                    <tr className="border-b border-zinc-100 bg-zinc-50/70 dark:border-zinc-900 dark:bg-zinc-900/30">
                      <td colSpan={8} className="px-2 py-3">
                        <div className="grid gap-2 sm:grid-cols-3">
                          <label className="text-xs text-zinc-600 dark:text-zinc-300">
                            Amount
                            <input
                              type="number"
                              min={0}
                              value={payment.amount}
                              onChange={(e) =>
                                setPayments((prev) =>
                                  prev.map((item) =>
                                    item.paymentId === payment.paymentId
                                      ? { ...item, amount: Number(e.target.value) || 0 }
                                      : item,
                                  ),
                                )
                              }
                              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                            />
                          </label>
                          <label className="text-xs text-zinc-600 dark:text-zinc-300">
                            Method
                            <input
                              value={payment.paymentMethod}
                              onChange={(e) =>
                                setPayments((prev) =>
                                  prev.map((item) =>
                                    item.paymentId === payment.paymentId
                                      ? { ...item, paymentMethod: e.target.value }
                                      : item,
                                  ),
                                )
                              }
                              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                            />
                          </label>
                          <label className="text-xs text-zinc-600 dark:text-zinc-300">
                            Transaction Ref
                            <input
                              value={payment.transactionReference ?? ""}
                              onChange={(e) =>
                                setPayments((prev) =>
                                  prev.map((item) =>
                                    item.paymentId === payment.paymentId
                                      ? { ...item, transactionReference: e.target.value }
                                      : item,
                                  ),
                                )
                              }
                              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                            />
                          </label>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
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
          Hardcoded sample data based on your refund model.
        </p>

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
                <Fragment key={refund.refundId}>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="px-2 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {refund.refundId}
                    </td>
                    <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                      {refund.paymentId}
                    </td>
                    <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                      {refund.userId}
                    </td>
                    <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                      {money(refund.refundAmount, "USD")}
                    </td>
                    <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                      {refund.refundReason}
                    </td>
                    <td className="px-2 py-3">
                      <select
                        value={refund.refundStatus}
                        onChange={(e) =>
                          setRefunds((prev) =>
                            prev.map((item) =>
                              item.refundId === refund.refundId
                                ? {
                                    ...item,
                                    refundStatus: e.target.value as RefundRecord["refundStatus"],
                                  }
                                : item,
                            ),
                          )
                        }
                        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                      >
                        {Object.values(REFUND_STATUS).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingRefundId((id) =>
                              id === refund.refundId ? null : refund.refundId,
                            )
                          }
                          className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                        >
                          {editingRefundId === refund.refundId ? "Cancel" : "Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setRefunds((prev) =>
                              prev.filter((item) => item.refundId !== refund.refundId),
                            )
                          }
                          className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingRefundId === refund.refundId ? (
                    <tr className="border-b border-zinc-100 bg-zinc-50/70 dark:border-zinc-900 dark:bg-zinc-900/30">
                      <td colSpan={7} className="px-2 py-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <label className="text-xs text-zinc-600 dark:text-zinc-300">
                            Refund Amount
                            <input
                              type="number"
                              min={0}
                              value={refund.refundAmount}
                              onChange={(e) =>
                                setRefunds((prev) =>
                                  prev.map((item) =>
                                    item.refundId === refund.refundId
                                      ? { ...item, refundAmount: Number(e.target.value) || 0 }
                                      : item,
                                  ),
                                )
                              }
                              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                            />
                          </label>
                          <label className="text-xs text-zinc-600 dark:text-zinc-300">
                            Reason
                            <input
                              value={refund.refundReason}
                              onChange={(e) =>
                                setRefunds((prev) =>
                                  prev.map((item) =>
                                    item.refundId === refund.refundId
                                      ? { ...item, refundReason: e.target.value }
                                      : item,
                                  ),
                                )
                              }
                              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                            />
                          </label>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
