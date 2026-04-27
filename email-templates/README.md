# Grimior Email Templates

These ten HTML email templates are designed to be uploaded to Klaviyo (preferred) or Mailchimp transactional. Each is a self-contained HTML file. They are triggered by ReCharge webhook events, scheduled sends, or admin actions — all routed through `/api/webhook-recharge` (which calls Klaviyo's `/api/events/` endpoint with a `template` property matching the filename).

| Template ID                | Trigger                              | Cadence            |
|----------------------------|--------------------------------------|--------------------|
| `grimior-welcome`          | ReCharge `subscription/activated`     | Once on activation |
| `grimior-access`           | After welcome (Klaviyo flow + 30 min) | Once               |
| `grimior-renewal`          | ReCharge `charge/paid`                | Monthly            |
| `grimior-ritual`           | Scheduled — 1st of each month         | Monthly            |
| `grimior-tarot`            | Scheduled — daily/weekly              | Subscriber-chosen  |
| `grimior-promo`            | Scheduled — 15th of each month        | Monthly            |
| `grimior-new-content`      | Manual / admin                        | Ad-hoc             |
| `grimior-cancelled`        | ReCharge `subscription/cancelled`     | Once               |
| `grimior-failed-payment`   | ReCharge `charge/failed`              | Per failure        |
| `grimior-reminder`         | ReCharge `charge/upcoming`            | 3 days before      |

Every template (except cancellation) includes the cancel-subscription link
`{{ site_url }}/profile#cancel`. All templates use the same parchment-and-gold
typography for a unified visual brand across the inbox.

Variables (use `{{ }}` Handlebars-style — Klaviyo and Mailchimp both support):
- `{{ first_name }}`
- `{{ site_url }}`
- `{{ renewal_date }}`
- `{{ access_until }}`
- `{{ amount }}`
- `{{ month }}`
- `{{ promo_code }}`
- `{{ card_name }}`
- `{{ card_meaning }}`
- `{{ card_image_url }}`
