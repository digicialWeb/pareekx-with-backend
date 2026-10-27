# My Orders Firebase Integration

Updated `src/pages/dealer/MyOrders.jsx` and `src/pages/salesperson/MyOrders.jsx` to subscribe to Firestore `orders` in real time.

- Dealer My Orders filters by `dealerUid == signed-in user's Firebase UID`.
- Salesperson My Orders filters by `salespersonUid == signed-in user's Firebase UID`.
- Both pages normalize the existing order payload fields and display loading/error states.
- Demo order reset controls were removed so sample orders cannot be mistaken for live records.

Firestore rules must allow each authenticated user to read orders where their UID matches the corresponding field. Existing `orders` rules from this project include this ownership check.

To run locally: `npm install` then `npm run dev`.
