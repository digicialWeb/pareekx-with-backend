# Settings Firebase Update

- Admin Settings now loads the `settings/app` document from Firestore.
- Save Changes writes profile, company, and notification preferences to Firestore.
- Password changes use Firebase Authentication reauthentication and `updatePassword` rather than a frontend-only demo message.
- The current profile email field is a contact/display field; it does not change the Firebase Authentication login email.

## Firestore rules
The deployed rules must permit active admins to read and write documents in the `settings` collection. The provided `firestore.rules` already includes `settings` in its admin-only collection list. Publish the same rules in Firebase Console if they are not already deployed.

## Test
1. Sign in as an active ADMIN.
2. Open Admin > Settings and wait for settings to load.
3. Change a company field and a notification toggle; click Save Changes.
4. Refresh and confirm values persist.
5. To test password changes, enter the current password and a new password of at least 6 characters. Sign in again with the new password.
