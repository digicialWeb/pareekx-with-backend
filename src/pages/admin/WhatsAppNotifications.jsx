import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import {
  Bell,
  Check,
  MessageCircle,
  Pencil,
  RotateCcw,
  Save,
  Send,
  ShoppingCart,
  Truck,
  Users,
  X,
} from "lucide-react";

const defaultSettings = {
  enabled: true,
  newOrder: true,
  confirmed: true,
  processing: true,
  dispatched: true,
  delivered: true,
  dealer: true,
  salesperson: true,
};

const defaultTemplates = [
  {
    key: "newOrder",
    title: "New Order",
    description: "Send when a dealer or salesperson places a new order.",
    message:
      "Hello {{name}}, your order {{orderId}} has been received successfully. We will update you as it progresses.",
    icon: ShoppingCart,
  },
  {
    key: "confirmed",
    title: "Order Confirmed",
    description: "Send when an order is confirmed by the admin team.",
    message:
      "Hello {{name}}, your order {{orderId}} has been confirmed and is now being prepared.",
    icon: Check,
  },
  {
    key: "processing",
    title: "Processing",
    description: "Send when production or processing starts.",
    message:
      "Hello {{name}}, your order {{orderId}} is currently in processing. We will keep you updated.",
    icon: Bell,
  },
  {
    key: "dispatched",
    title: "Dispatched",
    description: "Send when the order leaves for delivery.",
    message:
      "Hello {{name}}, your order {{orderId}} has been dispatched. Transport details will be shared with you shortly.",
    icon: Truck,
  },
  {
    key: "delivered",
    title: "Delivered",
    description: "Send after the order is marked delivered.",
    message:
      "Hello {{name}}, your order {{orderId}} has been delivered successfully. Thank you for choosing Pareek.",
    icon: Check,
  },
];

const toggleRows = [
  ["dealer", "Dealer Notifications", "Send order updates to dealers."],
  ["salesperson", "Salesperson Notifications", "Send order updates to assigned salespersons."],
];

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative h-6 w-11 rounded-full transition ${
        checked ? "bg-slate-900" : "bg-slate-200"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function WhatsAppNotifications() {
  const [settings, setSettings] = useState(defaultSettings);
  const [templates, setTemplates] = useState(defaultTemplates);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const settingsRef = doc(db, "settings", "whatsapp");
        const settingsSnap = await getDoc(settingsRef);
        const templateSnaps = await Promise.all(
          defaultTemplates.map((item) => getDoc(doc(db, "whatsappTemplates", item.key)))
        );

        if (cancelled) return;

        if (settingsSnap.exists()) {
          setSettings({ ...defaultSettings, ...settingsSnap.data() });
        }

        const savedTemplates = templateSnaps
          .filter((snap) => snap.exists())
          .map((snap) => ({ key: snap.id, ...snap.data() }));

        if (savedTemplates.length) {
          setTemplates(defaultTemplates.map((item) => ({
            ...item,
            ...(savedTemplates.find((savedItem) => savedItem.key === item.key) || {}),
          })));
        }
      } catch (error) {
        console.error("Unable to load WhatsApp settings from Firestore:", error);
        if (!cancelled) {
          setLoadError(error?.code === "permission-denied"
            ? "Permission denied. Check that the published Firestore rules allow admins to access settings and whatsappTemplates."
            : "Could not load WhatsApp settings from Firebase. Please try refreshing.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSettings();
    return () => { cancelled = true; };
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const startEditingTemplate = (item) => {
    setEditingTemplate(item.key);
    setDraftMessage(item.message);
  };

  const cancelEditingTemplate = () => {
    setEditingTemplate(null);
    setDraftMessage("");
  };

  const saveTemplate = (key) => {
    const message = draftMessage.trim();
    if (!message) return;

    setTemplates((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, message } : item
      )
    );
    setEditingTemplate(null);
    setDraftMessage("");
    setSaved(false);
  };

  const resetTemplate = (key) => {
    const original = defaultTemplates.find((item) => item.key === key);
    if (!original) return;
    setDraftMessage(original.message);
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      await setDoc(doc(db, "settings", "whatsapp"), {
        ...settings,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      await Promise.all(templates.map(({ icon, ...item }) =>
        setDoc(doc(db, "whatsappTemplates", item.key), {
          ...item,
          updatedAt: serverTimestamp(),
        }, { merge: true })
      ));

      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Unable to save WhatsApp settings to Firestore:", error);
      setSaveError(error?.code === "permission-denied"
        ? "Permission denied. Publish the admin-only Firestore rules for settings and whatsappTemplates."
        : "Could not save settings to Firebase. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 pb-8">
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Loading WhatsApp settings from Firebase...
        </div>
      )}
      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {saveError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {saveError}
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Administration</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            WhatsApp Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure order notifications and message templates for future WhatsApp API integration.
          </p>
        </div>
        <button
          type="button"
          onClick={saveSettings}
          disabled={loading || saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saved ? <Check size={17} /> : <Save size={17} />}
          {saving ? "Saving..." : saved ? "Saved" : "Save Settings"}
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <MessageCircle size={21} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">WhatsApp Integration</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Enable or disable WhatsApp notifications for the system.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                settings.enabled
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {settings.enabled ? "Enabled" : "Disabled"}
            </span>
            <Toggle
              checked={settings.enabled}
              onChange={(value) => updateSetting("enabled", value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <Bell size={19} className="text-slate-700" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Order Notifications</h2>
            <p className="text-xs text-slate-500">
              Choose which order status events should trigger WhatsApp messages.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {templates.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center justify-between gap-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                  </div>
                </div>
                <Toggle
                  checked={settings[item.key]}
                  disabled={!settings.enabled}
                  onChange={(value) => updateSetting(item.key, value)}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <Users size={19} className="text-slate-700" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Recipients</h2>
            <p className="text-xs text-slate-500">Choose who receives operational updates.</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {toggleRows.map(([key, title, description]) => (
            <div key={key} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{description}</p>
              </div>
              <Toggle
                checked={settings[key]}
                disabled={!settings.enabled}
                onChange={(value) => updateSetting(key, value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <Send size={19} className="text-slate-700" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Message Templates</h2>
            <p className="text-xs text-slate-500">
              Preview the messages that will later be connected to the WhatsApp API.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {templates.map((item) => (
            <div key={item.key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      settings[item.key] && settings.enabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {settings[item.key] && settings.enabled ? "Active" : "Off"}
                  </span>
                  {editingTemplate !== item.key && (
                    <button
                      type="button"
                      onClick={() => startEditingTemplate(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {editingTemplate === item.key ? (
                <div className="mt-3 rounded-xl border border-slate-300 bg-white p-4">
                  <label className="text-xs font-semibold text-slate-700">Message Template</label>
                  <textarea
                    value={draftMessage}
                    onChange={(event) => setDraftMessage(event.target.value)}
                    rows={5}
                    maxLength={1000}
                    autoFocus
                    className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                    placeholder="Write your WhatsApp message..."
                  />

                  <div className="mt-2 flex flex-col gap-2 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>Available variables: <code className="rounded bg-slate-100 px-1 py-0.5">{"{{name}}"}</code> <code className="rounded bg-slate-100 px-1 py-0.5">{"{{orderId}}"}</code></span>
                    <span>{draftMessage.length}/1000 characters</span>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => resetTemplate(item.key)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <RotateCcw size={13} />
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditingTemplate}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <X size={13} />
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!draftMessage.trim()}
                      onClick={() => saveTemplate(item.key)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check size={13} />
                      Save Template
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                  {item.message}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <strong>Configuration only:</strong> Notification settings and message templates are saved in Firestore. Actual WhatsApp delivery is not enabled yet; it requires a secure backend integration with WhatsApp Business Platform or another supported provider. Keep provider credentials out of this frontend.
      </div>
    </div>
  );
}
