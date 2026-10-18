# WhatsApp Notifications — Firebase configuration

- `settings/whatsapp` stores the notification toggles.
- `whatsappTemplates/{newOrder|confirmed|processing|dispatched|delivered}` stores message templates.
- The admin page reads from Firestore on load and saves settings/templates to Firestore.
- The Firestore rules included in this project allow only an active ADMIN profile to read/write these settings through the admin-only collection rule.
- This update does not send WhatsApp messages. Real delivery requires a backend (recommended: Spring Boot) and WhatsApp Business Platform/provider credentials stored securely on the server, never in React.
