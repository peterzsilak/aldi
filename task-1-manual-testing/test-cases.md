# Task 1: Manual Testing — Test Cases

**Feature:** Add to Cart (ALDI storefront)  
**Target Application:** ALDI US Web Application (`aldi.us`) — Instacart-powered storefront under `/store/aldi/…`

> **Verified against the live site on 2026-09-03.** `aldi.us` redirects to `/store/aldi/storefront`. The site has **no "Shopping List" feature** — products are added to a **Cart** via an **"Add"** button on the product card (`aria-label="Add 1 ct <product>"`), and the header exposes a cart counter (`aria-label="View Cart. Items in cart: N"`). All test cases below are written for an **unauthenticated (guest) session** and every expected result was observed on the live site — no account credentials are required to execute them.

### Application-Level Notes (apply to all test cases)
- On first visit two modals must be dismissed before any product interaction: the **Cookie Notice** and the **"How would you like to shop?"** fulfillment modal (Delivery / Pickup).
- Product availability and pricing are **store- and fulfillment-specific** (e.g., `ALDI - BAT 18 - Geneva, IL`, ZIP `60174`), so test data must be validated per store context.
- After a product is added, the "Add" button is replaced by a **quantity stepper** (`Increment quantity of <product>` / `Decrement quantity of <product>` / `Remove <product>`); a product cannot be added a second time via the "Add" button.
- **The header cart counter counts distinct line items, not total units.** Raising a product's quantity from 1 to 2 leaves the counter unchanged; only adding a *different* product increments it.
- Guest carts are supported: adding products requires **no authentication**, and the cart persists across page reloads within the session.
- Delivery orders are subject to a **$10 minimum** — below it the checkout control is disabled and labelled `$10 Min. to checkout`, so checkout-stage behavior is not reachable with a small test cart.

---

## Test Case Structure
Each test case contains the following fields:
- **Test Case ID:** Unique identifier for tracking.
- **Title:** Summary of what is being tested.
- **Description / Objective:** Brief explanation of the test goal and scenario context.
- **Test Type:** Level or phase of testing (e.g., Functional, Non-Functional, Regression, Smoke, Sanity).
- **Test Category:** Domain or functional area being tested (e.g., UI, API, Security, Performance, Integration).
- **Priority:** High / Medium / Low execution priority.
- **Automation Status:** Indicates whether the test is automated or manual (e.g., Manual, Automated, Candidate for Automation).
- **Component / Module:** Specific subsystem or architectural unit under test.
- **Test Suite:** The suite or test set the test case belongs to (e.g., Cart — Regression Suite).
- **Requirement / Traceability:** Link to the specific User Story ID, Requirement ID, or Jira ticket being verified.
- **Preconditions:** Initial state required before execution.
- **Test Steps:** Sequential actions performed by the tester.
- **Test Data:** Specific values used during testing.
- **Expected Result:** Anticipated system behavior.
- **Postconditions / Cleanup:** Required system teardown or cleanup state after execution.

---

### TC-001: Add a Single Product to the Cart (Guest Session)
- **Test Case ID:** TC-001
- **Title:** Add a single product to the cart from the search results page
- **Description / Objective:** Verify that a product can be added to the cart from the search results page, and that the header cart counter, the card's quantity stepper, and the cart contents reflect the change correctly.
- **Test Type:** Functional, Smoke
- **Test Category:** UI, Integration
- **Priority:** High
- **Automation Status:** Candidate for Automation
- **Component / Module:** Web Frontend — Product Card / Cart
- **Test Suite:** Cart — Smoke Suite
- **Requirement / Traceability:** US-101 — "As a shopper I can add a product to my cart"
- **Preconditions:**
    1. Guest (unauthenticated) session with cookies and local storage cleared.
    2. The browser is open at `https://www.aldi.us` (redirects to `/store/aldi/storefront`).
    3. The Cookie Notice has been dismissed and a fulfillment option (Delivery or Pickup) has been selected in the "How would you like to shop?" modal.
    4. The cart is currently empty (header shows `Items in cart: 0`).
- **Test Steps:**
    1. Search for a product using the header search field (results open at `/store/aldi/s?k=<term>`).
    2. Click the **"Add"** button on the target product card.
    3. Open the cart via the header **"View Cart"** button.
- **Test Data:**
    - Search term: `chips`
    - Product Name: `Clancy's Wavy Potato Chips` (10 oz, $1.79)
    - Store context: `ALDI - BAT 18 - Geneva, IL` / ZIP `60174`
- **Expected Result:**
    - The header cart counter increments from `0` to `1` (`aria-label="View Cart. Items in cart: 1, View cart"`).
    - The card's "Add" button is replaced by a quantity stepper exposing `Increment quantity of <product>` and `Remove <product>` controls, showing `Quantity: 1 item`.
    - The cart contains `Clancy's Wavy Potato Chips` with the correct title, price, and quantity = 1.
- **Postconditions / Cleanup:**
    - The item persists in the cart after a page reload.
    - Remove the added item to restore the empty-cart baseline for subsequent runs.

---

### TC-002: Add a Product to the Cart Without Being Logged In (Guest Session)
- **Test Case ID:** TC-002
- **Title:** Guest user can add a product to the cart without being prompted to authenticate
- **Description / Objective:** Verify the unauthenticated path: a guest can add a product to the cart without being blocked by a login prompt, and the guest cart persists across a page reload while the session remains unauthenticated.
- **Test Type:** Functional, Regression
- **Test Category:** UI, Security (Authentication)
- **Priority:** High
- **Automation Status:** Candidate for Automation
- **Component / Module:** Web Frontend — Product Card / Cart / Authentication Flow
- **Test Suite:** Cart — Regression Suite
- **Requirement / Traceability:** US-102 — "Guests can build a cart without signing in"
- **Preconditions:**
    1. User is NOT logged into any account (guest session, cookies and local storage cleared).
    2. The browser is open at `https://www.aldi.us` (redirects to `/store/aldi/storefront`).
    3. The Cookie Notice has been dismissed and a fulfillment option has been selected in the "How would you like to shop?" modal.
    4. The header shows `Sign In / Register` and `Items in cart: 0`.
- **Test Steps:**
    1. Search for a product and open the search results page.
    2. Click the **"Add"** button on the target product card.
    3. Observe the header cart counter and check whether any login prompt appears.
    4. Reload the page and re-check the cart counter and the header account link.
- **Test Data:**
    - Search term: `chips`
    - Product Name: `Clancy's Wavy Potato Chips`
- **Expected Result:**
    - **Step 2-3:** The product is added to the guest cart and the header counter increments from `0` to `1`. **No login or registration modal is triggered** — adding to cart does not require authentication.
    - **Step 4:** After reload the counter still shows `1`, confirming the guest cart persists in the session.
    - The header continues to show `Sign In / Register` throughout, confirming the session remains unauthenticated.
- **Postconditions / Cleanup:**
    - The guest session remains unauthenticated.
    - Empty the guest cart and clear cookies/local storage to reset the guest state.

> **Note:** Enforcement of authentication at checkout is **out of scope for this test** and is covered separately, because the checkout control is disabled until the $10 delivery minimum is met and therefore cannot be exercised with a single low-priced item.

---

### TC-003: Add Multiple Products and Verify Cart Aggregation (Guest Session)
- **Test Case ID:** TC-003
- **Title:** Add multiple products and verify quantity aggregation and totals in the cart
- **Description / Objective:** Verify that adding two distinct products and raising the quantity of one of them produces correct distinct cart entries, per-line quantities and prices, an accurate cart total, and a header counter that correctly reflects **distinct line items**.
- **Test Type:** Functional, Regression
- **Test Category:** UI, Integration
- **Priority:** Medium
- **Automation Status:** Candidate for Automation
- **Component / Module:** Web Frontend — Cart Aggregation / Totals
- **Test Suite:** Cart — Regression Suite
- **Requirement / Traceability:** US-103 — "Cart aggregates line quantities and displays accurate totals"
- **Preconditions:**
    1. Guest (unauthenticated) session with cookies and local storage cleared.
    2. The browser is open at `https://www.aldi.us` (redirects to `/store/aldi/storefront`).
    3. The Cookie Notice has been dismissed and a fulfillment option has been selected in the "How would you like to shop?" modal.
    4. The cart is currently empty (header shows `Items in cart: 0`).
- **Test Steps:**
    1. Search for Product A and click **"Add"** on its product card. Observe the header counter.
    2. On Product A's card, click **"Increment quantity of `<Product A>`"** to raise its quantity to 2. Observe the header counter. *(The "Add" button is no longer available once the product is in the cart.)*
    3. Search for Product B and click **"Add"** on its product card. Observe the header counter.
    4. Open the cart via the header **"View Cart"** button.
- **Test Data:**
    - Product A: `Clancy's Wavy Potato Chips` (10 oz, $1.79 each)
    - Product B: `Clancy's Barbecue Potato Chips` (9.5 oz, $1.99 each)
    - Search term: `chips`
- **Expected Result:**
    - **Step 1:** Header counter increments `0` → `1`; Product A's stepper shows `Quantity: 1 item`.
    - **Step 2:** Product A's stepper shows `Quantity: 2 items`, but the header counter **remains `1`** — the counter tracks distinct line items, not total units.
    - **Step 3:** Header counter increments `1` → `2`.
    - **Step 4:** The cart contains exactly 2 distinct entries with correctly aggregated line prices:
        - `Clancy's Wavy Potato Chips (10 oz)` — Quantity `2 ct`, line price `$3.58` (2 × $1.79).
        - `Clancy's Barbecue Potato Chips` — Quantity `1 ct`, line price `$1.99`.
    - The cart total displays `$5.57` ($3.58 + $1.99).
- **Postconditions / Cleanup:**
    - Both products remain persisted in the cart after a page reload.
    - Empty the cart to restore the empty-cart baseline for subsequent runs.