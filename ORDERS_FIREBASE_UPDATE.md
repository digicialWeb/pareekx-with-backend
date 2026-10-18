# PareekX Orders Firebase Update

## Included
- New Order now writes order documents to Firestore `orders` and shows an error if the write fails.
- Orders include `orderId`, dealer details, `dealerUid`, `salespersonUid`, flattened `items`, product/shade/pack details, delivery data, quantity totals, and status.
- Admin Orders subscribes to Firestore in real time.
- Admin status changes (Pending → In Production → Ready → Dispatched → Delivered) update the Firestore order document.
- Admin Orders no longer falls back to hardcoded demo orders.

## Run
1. Extract the ZIP.
2. Open the project folder in a terminal.
3. Run `npm install`, then `npm run dev`.
4. Log in as a salesperson or dealer, create a test order, then open Admin → Orders.
5. In Firebase Console → Firestore Database → `orders`, confirm the new document appears.

## Rules
The project `firestore.rules` file was aligned so admins can create user profiles. Confirm your deployed rules still allow admins to read orders and update order status. Do not publish broad public read/write rules.

Note: existing localStorage/demo orders are not migrated automatically; only newly created Firestore orders appear in the Firebase-backed admin list.
