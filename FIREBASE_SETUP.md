# PareekX Firebase setup (testing)

## Included in this update
- Firebase Authentication email/password login for dealer/salesperson and admin portals.
- Public signup creates **Dealer** accounts only. It cannot self-assign Salesperson/Admin roles.
- Admin Products page now reads and writes the Firestore `products` collection in real time.
- Firestore security rules are provided in `firestore.rules`.

## 1. Apply Firestore rules
Firebase Console → Build → Firestore Database → Rules. Replace the rules with the contents of `firestore.rules`, then Publish. Do not use open/test-mode rules.

## 2. Create the first Admin account
1. Firebase Console → Authentication → Users → Add user. Create an email/password account for the administrator.
2. Copy that user's UID.
3. Firestore Database → Data → Start collection `users`; document ID must be exactly that UID.
4. Add fields:
   - `name` (string): administrator's name
   - `email` (string): same email used in Authentication
   - `role` (string): `ADMIN`
   - `active` (boolean): `true`
5. Sign in through `/admin/login` with that email/password.

Do not let users choose ADMIN or SALESPERSON from public signup. Salesperson accounts should be provisioned by the admin until the user-management page is migrated to create Firebase Auth users securely.

## 3. Test
Run `npm install`, then `npm run build`. Sign in as admin, add a product, open the site in another browser/device, sign in with an account whose profile is configured, and verify the product appears. Product writes are restricted to Admin role.

## Important migration status
This is an incremental migration, not yet a full Firebase conversion. The Products page and login/signup flows are connected, but several other pages still contain localStorage/sample data (including some order, dealer, salesperson, profile and settings flows). Do not treat the whole app as cloud-synced until those remaining modules are migrated and tested. Existing demo data is not automatically imported into Firestore.
