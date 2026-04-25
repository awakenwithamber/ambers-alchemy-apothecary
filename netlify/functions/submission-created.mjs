// Triggered automatically when a Netlify Form submission is created.
// Stores every submission in Netlify Blobs so nothing is silently lost,
// queues a polite review request for completed orders, and records a
// dual-recipient notification entry (primary + backup) for every form.
//
// Email recipient configuration must also be set in the Netlify dashboard
// under Forms → Notifications. Recommended recipients for every form:
//   primary: awaken@consultant.com
//   backup : dare2be4ree@gmail.com
//
// This function exists so the data is durably captured even if the
// dashboard email step is missed — Amber can always retrieve every
// submission from the Blobs store.

import { getStore } from "@netlify/blobs";

const REVIEW_REQUEST_DELAY_DAYS = 10;

const PRIMARY_RECIPIENT = "awaken@consultant.com";
const BACKUP_RECIPIENT = "dare2be4ree@gmail.com";

const TRACKED_FORMS = new Set([
  "checkout-order",
  "contact",
  "newsletter",
  "custom-soap",
  "consultation",
  "quiz-lead",
]);

export default async (req) => {
  try {
    const body = await req.json();
    const payload = body.payload || {};
    const formName = payload.form_name || "unknown";
    const data = payload.data || {};
    const now = new Date();
    const submissionId =
      payload.id ||
      data["transaction-id"] ||
      `${formName}-${now.getTime()}`;

    const submissions = getStore("form-submissions");
    await submissions.setJSON(`${formName}/${submissionId}`, {
      formName,
      submissionId,
      data,
      submittedAt: payload.created_at || now.toISOString(),
      recipients: { primary: PRIMARY_RECIPIENT, backup: BACKUP_RECIPIENT },
    });

    const notifications = getStore("notification-log");
    await notifications.setJSON(`${formName}/${submissionId}`, {
      formName,
      submissionId,
      status: "queued",
      attemptedAt: now.toISOString(),
      recipients: [PRIMARY_RECIPIENT, BACKUP_RECIPIENT],
      summary: summarize(formName, data),
    });

    if (formName === "checkout-order") {
      const orderId = data["transaction-id"] || `ORD-${now.getTime()}`;
      const email = (data["email"] || "").toLowerCase().trim();
      const sendAt = new Date(
        now.getTime() + REVIEW_REQUEST_DELAY_DAYS * 24 * 60 * 60 * 1000
      );

      const order = {
        orderId,
        customerName: data["customer-name"],
        email,
        phone: data["phone"],
        shippingAddress: `${data["shipping-address"] || ""}, ${
          data["city-state-zip"] || ""
        }`,
        product: data["product-ordered"],
        quantity: data["quantity"],
        notes: data["order-notes"],
        transactionId: data["transaction-id"],
        paymentStatus: data["payment-status"],
        orderTotal: data["order-total"],
        promoCode: data["promo-code"] || null,
        submittedAt: payload.created_at || now.toISOString(),
      };

      const orders = getStore("orders");
      await orders.setJSON(orderId, order);

      if (email) {
        const reviewRequests = getStore("review-requests");
        await reviewRequests.setJSON(orderId, {
          orderId,
          email,
          customerName: data["customer-name"],
          product: data["product-ordered"],
          sendAt: sendAt.toISOString(),
          reminderAt: new Date(
            sendAt.getTime() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "queued",
          initialSent: false,
          reminderSent: false,
          createdAt: now.toISOString(),
        });
      }
    }

    if (!TRACKED_FORMS.has(formName)) {
      console.warn(
        `submission-created: unknown form "${formName}" — stored in form-submissions for review.`
      );
    }

    return new Response("OK");
  } catch (err) {
    console.error("submission-created error:", err);
    return new Response("Error", { status: 500 });
  }
};

function summarize(formName, data) {
  const name = data["customer-name"] || data["name"] || "(no name)";
  const email = data["email"] || "(no email)";
  switch (formName) {
    case "checkout-order":
      return `Order from ${name} <${email}> — ${data["product-ordered"] || ""}`;
    case "contact":
      return `Contact from ${name} <${email}> — ${data["topic"] || "General"}`;
    case "newsletter":
      return `Newsletter signup from ${name} <${email}>`;
    case "custom-soap":
      return `Custom soap request from ${name} <${email}>`;
    case "consultation":
      return `Consultation request from ${name} <${email}>`;
    case "quiz-lead":
      return `Quiz lead from ${name} <${email}>`;
    default:
      return `Submission to ${formName} from ${name} <${email}>`;
  }
}
