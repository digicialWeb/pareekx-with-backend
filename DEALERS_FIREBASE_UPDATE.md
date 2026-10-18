# PareekX Firebase Dealers Update

## What's included
- Admin Dealers page reads `dealers` and `salespersons` from Firestore in real time.
- Add Dealer creates an Email/Password Firebase Authentication account using a secondary Firebase app, so the signed-in admin session is not replaced.
- The new dealer profile is written to `users/{uid}` with role `DEALER` and the dealer details to `dealers/{uid}`.
- Edit and activate/deactivate operations update Firestore.
- Removing a dealer removes the directory record and marks the associated `users/{uid}` profile inactive. It does not permanently delete the Firebase Authentication user because that requires a trusted Admin SDK backend.

## Important
1. Keep the `apiKey` value in `src/firebase.js` equal to the Web API key shown in Firebase Console > Project settings > General > Web app config.
2. Publish the provided `firestore.rules` in Firebase Console > Firestore Database > Rules. These rules are designed for this project; review before deploying to production.
3. The Dealers page's salesperson dropdown reads the `salespersons` collection. Until the Salespersons module is connected to Firestore and records exist, the dropdown will only offer `Unassigned`.
4. Existing local/demo dealer records are not automatically imported. Add actual dealers through the Admin UI.
5. The current `firestore.rules` allow a signed-in user to create their own `users/{uid}` profile only when its role is `DEALER`. The secondary app flow uses that rule when creating dealer accounts.
