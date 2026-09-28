# Analytics events

All events go through `window.AAA.track(name, params)` (defined in
`analytics.js`). No personal data (names, emails, addresses, message text) is
ever sent as an event parameter.

| Event | Fired from | When | Parameters |
|---|---|---|---|
| `page_view` | analytics.js / navigation-history.js | Section or page change | page path |
| `view_item_list`, `view_item`, `select_item` | analytics.js helpers | Shop list / product views | GA4 items |
| `add_to_cart` | app.js `addToCart` | Item added | GA4 item, qty |
| `remove_from_cart` | app.js | Item removed | GA4 item |
| `begin_checkout` | app.js "Continue to Checkout" | Checkout opened | value, items |
| `add_payment_info` | app.js checkout submit | Order submitted with a method | value, `payment_type` = card / cashapp / venmo |
| `order_submitted` | app.js | Server accepted the order (status `awaiting_payment`) | method, value |
| `purchase` | app.js | **Only** when `/api/order-status` reports `payment_verified` (card orders after the signed Stripe webhook). Cash App / Venmo orders never fire `purchase` in the browser because Amber verifies them later. | transaction_id (order number), value, items |
| `search` | js/site-search.js | Debounced query with results | search_term, results |
| `search_no_result` | js/site-search.js | Debounced query with zero results | search_term |
| `search_result_click` | js/site-search.js | Result chosen | search_term, result_type, result_title |
| `lunna_open` | js/lunna.js | Lunna panel opened | — |
| `lunna_message` | js/lunna.js | Visitor sent a question (text not sent) | — |
| `lunna_escalate` | js/lunna.js | Server routed a question to Amber or emergency guidance | reason = amber / emergency |
| `quiz_start`, `quiz_complete`, `quiz_lead_captured`, `quiz_extended_results_requested` | herbal-advisor.js | Remedy quiz | quiz fields (no PII) |
| `builder_start`, `builder_complete`, `synth_custom_added`, `synth_allies_downloaded` | remedy builder scripts | Build a Remedy flow | — |
| `newsletter_signup`, `contact_form_submit` | js/form-handlers.js | Form submitted | form name |
| `click_to_call`, `click_to_email`, `outbound_click` | analytics.js | Link clicks | link type |
| `video_play`, `video_complete`, `scroll_depth` | analytics.js | Engagement | percent / video id |

Revenue reporting should use `payment_verified` orders in the database, not
browser `purchase` events, because manual payments are confirmed offline.
