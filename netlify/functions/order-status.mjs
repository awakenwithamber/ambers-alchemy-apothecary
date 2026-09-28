// GET /api/order-status?order=AA-260928-XXXXX&email=you@example.com
// Returns only the status of one order, and only when the email matches.

import { getDatabase } from "@netlify/database";
import { json, clean } from "../../lib/orders.mjs";

const LABELS = {
  submitted: "Submitted",
  awaiting_payment: "Awaiting payment",
  payment_verified: "Payment verified",
  processing: "Processing",
  shipped: "Shipped",
  cancelled: "Cancelled",
  refunded: "Refunded",
  payment_exception: "Payment needs review",
};

export default async (req) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  const url = new URL(req.url);
  const orderNumber = clean(url.searchParams.get("order"), 40).toUpperCase();
  const email = clean(url.searchParams.get("email"), 254).toLowerCase();
  if (!orderNumber || !email) return json({ error: "Order number and email are required." }, 400);

  const db = getDatabase();
  const [order] = await db.sql`
    SELECT order_number, status, payment_method, total_cents, created_at
    FROM orders WHERE order_number = ${orderNumber} AND lower(customer_email) = ${email}
  `;
  // Same response for "no such order" and "wrong email".
  if (!order) return json({ error: "We couldn't find that order." }, 404);

  return json({
    orderNumber: order.order_number,
    status: order.status,
    statusLabel: LABELS[order.status] || order.status,
    paymentMethod: order.payment_method,
    total: order.total_cents / 100,
    createdAt: order.created_at,
  });
};

export const config = { path: "/api/order-status" };
