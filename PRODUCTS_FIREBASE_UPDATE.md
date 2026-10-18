# PareekX Products Firebase update

- Admin Products page reads the `products` Firestore collection in real time.
- Add, edit, activate/deactivate, and delete operations use Firestore.
- Dealer and salesperson New Order forms now load active products from Firestore instead of the previous hardcoded catalogue.
- Product shades and pack sizes are read from each product record. Shade objects saved by the Admin Products form are normalized to shade names for order selection.
- Orders retain the selected Firestore product document ID and product name.

## Test
1. Run `npm install` and `npm run dev`.
2. Sign in as Admin and open Products. Add an active product with at least one shade and one pack size.
3. Sign in as Dealer or Salesperson and open New Order. Confirm the product, shade, and pack-size options match the Firebase catalogue.
4. Place a test order and confirm the selected product details appear in Firestore.

The `products` collection rules must permit authenticated users with an active user profile to read products and admins to write them.
