# Required Firestore Rules change for Salespersons

In Firebase Console → Firestore Database → Rules, inside `match /users/{userId}`, change the existing `allow create` rule so an active admin can create salesperson profiles while self-signup remains limited to DEALER accounts:

```javascript
allow create: if isAdmin() || (signedIn()
  && request.auth.uid == userId
  && request.resource.data.role == 'DEALER'
  && request.resource.data.email == request.auth.token.email);
```

Keep the existing `isAdmin()` function and the admin-only collection rule that includes `'salespersons'`. Click **Publish** after changing the rule.

The app creates a salesperson Firebase Authentication account using a separate Firebase app, then writes that user's `users/{uid}` profile and `salespersons/{uid}` record while the admin session remains signed in. The `users` create rule must therefore allow the admin.
