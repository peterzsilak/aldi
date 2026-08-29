# Task 1: Manual Testing — Sample Bug Report

## Bug Report Fields Definition
- **Bug ID:** Unique defect identifier.
- **Title:** Short, concise description of the bug (What, Where, Under what conditions).
- **Status:** Current state in the defect lifecycle (e.g., New, In Progress, Ready for Test, Closed, Reopened).
- **Severity:** Impact on the business/system functionality (Blocker / Critical / Major / Minor / Trivial).
- **Priority:** Urgency of the fix (P1 - High / P2 - Medium / P3 - Low).
- **Label:** Issue category or functional area tag used for grouping related defects.
- **Reporter:** Person who identified and filed the defect.
- **Assignee:** The owner responsible for triage and resolution.
- **Component / Module:** Specific subsystem or architectural unit affected (e.g., Auth API, Payment Gateway).
- **Parent / Epic:** The parent work item or epic the bug belongs to.
- **Affects Version / Build:** Specific software release or build number where the bug was discovered.
- **Fix Version / Milestone:** Targeted release or sprint planned for delivering the fix.
- **Environment:** Browser, OS, device, app version, and URL where the issue occurred.
- **Preconditions:** Prerequisite setup required to reproduce the bug.
- **Steps to Reproduce:** Exact step-by-step instructions.
- **Expected Result:** Intended application behavior.
- **Actual Result:** Unintended behavior observed.
- **Attachments / Evidence:** Screenshots, network logs (HAR), console errors, or video recordings.
- **Logs & Stack Trace:** Relevant server-side logs or application stack traces.
- **Resolution:** Outcome status when closing the defect (e.g., Fixed, Won't Fix, Duplicate, Cannot Reproduce, As Designed).
- **Root Cause:** Technical underlying reason identified during investigation.

---

## BUG-101: Shopping list total item counter fails to update when adding items from search results

- **Bug ID:** BUG-101
- **Title:** Shopping list counter does not increment in header when adding products from Search Results page
- **Status:** New
- **Severity:** Major
- **Priority:** P2 - Medium
- **Label:** `ui`, `shopping-list`, `search`, `state-management`
- **Reporter:** Peter Zsilak
- **Assignee:** unassigned
- **Component / Module:** Web Frontend — Search Results / Shopping List Header Widget
- **Parent / Epic:** EPIC-10 — Shopping List Experience
- **Affects Version / Build:** Web 4.18.2 (build 2026.08.28-1)
- **Fix Version / Milestone:** TBD — proposed Sprint 42
- **Environment:**
    - **OS:** macOS Tahoe 26.6.1
    - **Browser:** Chrome 152.0.7977.64 (64-bit)
    - **URL:** `https://www.aldi.us/en/search-results/?q=chips`
    - **User Role:** Logged-in authenticated user
- **Preconditions:**
    - Navigate to `https://www.aldi.us`.
    - User is logged into an active account.
    - Shopping list currently has 0 items.

- **Steps to Reproduce:**
    1. Type `chips` into the top search bar and press Enter.
    2. On the search results page, locate the first product card.
    3. Click the **"Add to Shopping List"** button on the product card.
    4. Observe the Shopping List icon counter in the sticky header.
    5. Refresh the web page.

- **Expected Result:**
    - **Step 4:** A success notification should appear, and the header shopping list counter should instantly increment from `0` to `1`.
    - **Step 5:** After page refresh, the counter should retain the value `1`.

- **Actual Result:**
    - **Step 4:** The product item state changes to "Added", but the shopping list header counter remains `0`.
    - **Step 5:** Upon manually refreshing the page, the header counter updates to `1`, indicating state persistence is functional, but UI reactive state binding on the search results page is broken.

- **Impact:**
  Users do not receive immediate visual feedback in the header after adding items from search results, leading them to click the button multiple times, causing duplicate entries in their list.

- **Workaround:**
  Manually refreshing the browser updates the counter correctly.

- **Attachments / Evidence:**
    - `console_network_trace.har` (showing 200 OK API response on `POST /api/v1/shopping-list/items`).
    - `ui_counter_issue.mp4` (screen recording of the bug).

- **Logs & Stack Trace:**
    - No server-side errors; `POST /api/v1/shopping-list/items` returns `200 OK` with the updated item count.
    - Browser console warning: `Warning: Cannot update state on unmounted component (HeaderShoppingListCounter)`.

- **Resolution:** Unresolved — open for investigation.

- **Root Cause:** Not confirmed. Preliminary analysis suggests the header counter component does not subscribe to the shopping list store updates triggered from the search results page, so the state change is not propagated until a full page reload.