---
name: Cart architecture (two systems)
description: The site has two cart implementations; only app.js reaches checkout, and it dedupes by name.
---

# Two cart systems coexist on index.html

The page loads BOTH `app.js` and `js/cart.js`:

- `app.js` owns `let cart = []` (in-memory, NOT persisted to localStorage). The on-site Stripe checkout reads ONLY this array. Add via `window.addItemToCart(item)`. Item shape it renders: `{name, price, qty, form, symptoms, herbs, size}` (fixed labels in the cart drawer).
- `js/cart.js` exposes `window.AACart` backed by localStorage key `aa_cart`. It has its own drawer but **no checkout path** — items added via `AACart.add` never reach the app.js checkout.

**Rule:** anything that must be purchasable MUST go through `window.addItemToCart` (app.js), not `AACart`. The custom soap builder (`js/soap-builder.js`) and the quiz (`herbal-advisor.js` `synthAddCustomToCart`) both route to `window.addItemToCart`.

**Why:** before this was fixed, the soap builder added to `AACart` only, so custom soaps silently never appeared at checkout and couldn't be bought.

**Dedup gotcha:** `window.addItemToCart` dedupes strictly by `item.name` (`cart.find(i => i.name === item.name)`, qty++ on match, keeps first item's metadata). So any item whose configuration varies MUST encode the full config in `name`, or different configs wrongly merge into one line. The soap builder builds `name = 'Custom Botanical Soap — <scent · barType · botanicals · color · benefits>'` for this reason.
