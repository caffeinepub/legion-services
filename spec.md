# Legion Services

## Current State
A dark-themed service marketplace website for Discord (Nitro, boosts, decorations) and Blox Fruits services. Customers can browse services and submit orders via a modal form. The backend stores orders with status (pending, inProgress, completed, cancelled) and exposes `getAllOrders`, `getOrdersByStatus`, and `updateOrderStatus` APIs. There is no admin interface to view or manage orders.

## Requested Changes (Diff)

### Add
- Admin orders panel: a protected `/admin` route accessible via a hidden link or secret path
- Admin login screen: a simple password-based gate (hardcoded admin PIN/password on frontend, no backend auth needed)
- Orders dashboard: table/list showing all orders with columns: Order ID, Service Name, Quantity, Payment Method, Contact Info, Notes, Status
- Status filter tabs: All, Pending, In Progress, Completed, Cancelled
- Status update control: dropdown or buttons per row to change an order's status (calls `updateOrderStatus`)
- Order count badges on each filter tab
- Admin nav link in navbar (subtle, e.g. small "Admin" text link)

### Modify
- App routing: add a `/admin` route alongside the main landing page (using a simple hash-based or URL state approach, no react-router needed — can use a state toggle or `window.location.hash`)
- Navbar: add a discreet admin link

### Remove
- Nothing removed

## Implementation Plan
1. Create `AdminPage.tsx` component with:
   - Login gate (password check, stored in sessionStorage)
   - Orders table with service name resolution (map serviceId to name using `getAllServices`)
   - Filter tabs (All / Pending / In Progress / Completed / Cancelled) with counts
   - Per-row status update select/dropdown using `updateOrderStatus` mutation
   - Loading/empty/error states
2. Add routing logic to `App.tsx`: check `window.location.hash === '#admin'` or a state variable to render `AdminPage` vs the normal landing page
3. Add a subtle "Admin" link in the Navbar footer or as a small footer link
4. Wire backend hooks: `useAllOrders`, `useAllServices`, `useUpdateOrderStatus` in `useQueries.ts`
