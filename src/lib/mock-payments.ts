export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export const REFUND_STATUS = {
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export type RefundStatus = (typeof REFUND_STATUS)[keyof typeof REFUND_STATUS];

export type PaymentRecord = {
  paymentId: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: PaymentStatus;
  transactionReference?: string;
  metadata?: Record<string, string | number>;
};

export type RefundRecord = {
  refundId: string;
  paymentId: string;
  userId: string;
  refundAmount: number;
  refundReason: string;
  refundStatus: RefundStatus;
};

export const mockPayments: PaymentRecord[] = [
  {
    paymentId: "pay_8b6a7e2b",
    bookingId: "book_1001",
    userId: "user_alex_01",
    amount: 120.0,
    currency: "USD",
    paymentMethod: "CARD",
    status: PAYMENT_STATUS.SUCCESS,
    transactionReference: "txn_51327",
    metadata: { gateway: "stripe", event: "Phoenix Summit" },
  },
  {
    paymentId: "pay_2f73d18a",
    bookingId: "book_1002",
    userId: "user_nima_02",
    amount: 75.5,
    currency: "USD",
    paymentMethod: "CARD",
    status: PAYMENT_STATUS.PENDING,
    transactionReference: "txn_51328",
    metadata: { gateway: "stripe", event: "Frontend Night" },
  },
  {
    paymentId: "pay_6a98f3c1",
    bookingId: "book_1003",
    userId: "user_maya_03",
    amount: 240.0,
    currency: "USD",
    paymentMethod: "BANK_TRANSFER",
    status: PAYMENT_STATUS.REFUNDED,
    transactionReference: "txn_51329",
    metadata: { gateway: "manual", event: "Tech Expo" },
  },
  {
    paymentId: "pay_4c22d9f7",
    bookingId: "book_1004",
    userId: "user_rome_04",
    amount: 40.0,
    currency: "USD",
    paymentMethod: "CARD",
    status: PAYMENT_STATUS.FAILED,
    transactionReference: "txn_51330",
    metadata: { gateway: "stripe", event: "Workshop" },
  },
];

export const mockRefunds: RefundRecord[] = [
  {
    refundId: "ref_1001",
    paymentId: "pay_6a98f3c1",
    userId: "user_maya_03",
    refundAmount: 240.0,
    refundReason: "Event postponed",
    refundStatus: REFUND_STATUS.COMPLETED,
  },
  {
    refundId: "ref_1002",
    paymentId: "pay_2f73d18a",
    userId: "user_nima_02",
    refundAmount: 75.5,
    refundReason: "Duplicate booking",
    refundStatus: REFUND_STATUS.REQUESTED,
  },
];
