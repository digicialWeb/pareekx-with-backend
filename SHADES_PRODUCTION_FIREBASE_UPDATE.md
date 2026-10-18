# PareekX Shades and Production Summary Firebase Update

## Changes
- Admin Shades page reads the `shades`, `products`, and `orders` Firestore collections in real time.
- Add/edit/activate/deactivate shade operations write to Firestore.
- Product mapping options are sourced from active Firestore products.
- Shade order counts are derived from saved Firestore orders rather than static sample counts.
- Production Summary reads the `orders` collection in real time and aggregates quantity by product + shade + pack size.
- Removed hardcoded mock production orders; an empty-state message is shown when there are no orders.
- Loading and permission/error messages are shown when data cannot be loaded.

## Firestore Rules
The uploaded project's `firestore.rules` already allows only an active admin to read/write the `shades` collection, and allows admins to read orders. Publish those rules in Firebase Console if they are not already deployed.

## Run
```bash
npm install
npm run dev
```

Build verification could not be completed in this environment because the bundled Vite/Rolldown native optional dependency is missing for this runtime. Please run the commands locally and share any build error if one appears.
