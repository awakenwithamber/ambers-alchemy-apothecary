---
name: Cart architecture (two systems)
description: The site has two cart implementations; only app.js reaches checkout, and it dedupes by name.
---

# Two cart systems coexist on index.html

The page loads BOTH `app.js` and `js/cart.js`:

- `app.js` owns `let cart = []` (in-memory, NOT persisted to localStorage). The on-site Stripe checkout reads ONLY this array. Add via `window.addItemToCart(item)`. Item shape it renders: `{name, price, qty, form, symptoms, herbs, size}` (fixed labels in the cart drawer).
- `js/cart.js` exposes `window.AACart` backed by localStorage key `aa_cart`. It has its own drawer but **no checkout path** — items added via `AACart.add` never reach the app.js checkout.

**Rule:** anything that must be purchasable MUST reach app.js's `cart` array, not `AACart`. Two valid entry points exist: `window.addItemToCart(item)` and the global `addToCart(name, price, qty)` (both defined in app.js, same global scope). The quiz (`herbal-advisor.js` `synthAddCustomToCart`) uses `window.addItemToCart`; the live soap builder writes to `cart` directly (after checking `typeof addToCart === 'function'`).

**Why:** items added to `AACart` (localStorage) silently never appear at checkout and can't be bought.

## Soap builder: TWO files, only ROOT is live
There are two `soap-builder.js` files. The LIVE one is the **root** `soap-builder.js` — it defines `openSoapBuilder/closeSoapBuilder/sbNextStep/sbPrevStep/sbStartNew/sbAddToCart` and its IDs (`#sbStep1..5`, `#sbBaseOptions`, `#sbReviewPanel`, `.sb-progress-step`) match the `#soapBuilderModal` markup in index.html. The other, `js/soap-builder.js`, is a DEAD generic implementation (selectors `.soap-step`, `[data-bar-type]`) that matches no markup; it is marked DEPRECATED and must NOT be loaded.
**Why it matters:** index.html once loaded `/js/soap-builder.js`, so `openSoapBuilder` was undefined and the builder modal never opened. Fix = load root `soap-builder.js`.
**How to apply:** if the soap builder breaks, first confirm index.html's `<script>` points at root `soap-builder.js`, and edit behavior in the ROOT file, not `js/soap-builder.js`.

**Dedup gotchas:**
- `window.addItemToCart` dedupes strictly by `item.name`; items whose config varies must encode full config in `name` or different configs wrongly merge.
- `sbAddToCart` (root soap builder) does its OWN dedup directly on `cart`, matching on `name + herbs` (full config in `herbs`), and sorts selected option IDs per category so click order doesn't create duplicate lines.
