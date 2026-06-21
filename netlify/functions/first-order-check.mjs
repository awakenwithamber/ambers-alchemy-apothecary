// GET /.netlify/functions/first-order-check?email=someone@example.com
//
// Returns whether the provided email appears to be a first-time buyer
// and whether they are currently eligible for the first-order discount.
// Used by the frontend before surfacing the promo to avoid showing it
// to returning customers.

import { getStore } from "@netlify/blobs";
import { methodNotAllowed, badRequest, ok, cleanEmail, safeKey } from "../lib/http.mjs";

export default async (req) => {
  if (req.method !== "GET") return methodNotAllowed(req.method, ["GET"]);

  const url = new URL(req.url);
  const email = cleanEmail(url.searchParams.get("email") || "");
  if (!email) return badRequest("valid email required");

  const customers = getStore("customers");
  let record = null;
  try {
    record = await customers.get(safeKey(email), { type: "json" });
  } catch (_) {
    record = null;
  }

  const isFirstTimeBuyer = !record || !record.first_order_date;
  const eligibleForFirstOrder = isFirstTimeBuyer && !record?.has_used_first_order_discount;

  return ok({
    email,
    is_first_time_buyer: isFirstTimeBuyer,
    eligible_for_first_order_discount: eligibleForFirstOrder,
    eligible_for_followup_discount: Boolean(record?.eligible_for_followup_discount),
  });
};
