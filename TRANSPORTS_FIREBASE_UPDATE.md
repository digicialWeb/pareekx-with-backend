# Transports Firebase Update

The Admin Transports page now uses the Firestore `transports` collection instead of hardcoded sample transport records.

- Live list updates via Firestore `onSnapshot`.
- Add transport writes a document to `transports`.
- Edit transport updates its existing Firestore document.
- Activate/deactivate updates the document status.
- Loading and permission/error states are shown in the UI.
- The existing layout, search, status filter, and details modal are preserved.

The Firestore rules in `firestore.rules` already grant active admins read/write access to `transports` through the admin-only collections rule. Make sure those rules are published in the Firebase Console.

## Test

1. Run `npm install` and `npm run dev`.
2. Sign in with the active admin account.
3. Open Admin > Transports and add a test transport.
4. Verify the document appears in Firestore > `transports`.
5. Edit the transport and toggle its status; verify the document updates.

The transport order count remains the saved `orders` field (default `0`) until orders are explicitly linked to a transport in the order schema.
