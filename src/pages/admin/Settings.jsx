import { useEffect, useState } from "react";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import {
  Bell,
  Building2,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";

const defaultSettings = {
  profile: {
    name: "Admin",
    email: "admin@pareek.com",
    phone: "",
    designation: "Administrator",
  },
  company: {
    name: "Pareek",
    legalName: "Pareek",
    email: "",
    phone: "",
    gst: "",
    address: "",
  },
  notifications: {
    newOrder: true,
    orderStatus: true,
    dealerUpdates: true,
    salespersonUpdates: true,
    whatsapp: true,
  },
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100";

const sectionClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative h-6 w-11 rounded-full transition ${
        checked ? "bg-slate-900" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}

function Field({ label, icon: Icon, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        {Icon && (
          <Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputClass} ${Icon ? "pl-10" : ""}`}
        />
      </div>
    </label>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    let active = true;
    const loadSettings = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Please sign in again to load settings.");
        const snapshot = await getDoc(doc(db, "settings", "app"));
        if (!active) return;
        const stored = snapshot.exists() ? snapshot.data() : {};
        setSettings({
          ...defaultSettings,
          ...stored,
          profile: { ...defaultSettings.profile, ...(stored.profile || {}), email: stored.profile?.email || currentUser.email || defaultSettings.profile.email },
          company: { ...defaultSettings.company, ...(stored.company || {}) },
          notifications: { ...defaultSettings.notifications, ...(stored.notifications || {}) },
        });
      } catch (error) {
        if (active) {
          setMessage(error.code === "permission-denied"
            ? "Permission denied. Check that the published Firestore rules allow admins to access the settings collection."
            : error.message || "Could not load settings from Firebase.");
          setMessageType("error");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadSettings();
    return () => { active = false; };
  }, []);

  const updateSection = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Please sign in again before saving settings.");
      await setDoc(doc(db, "settings", "app"), {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
      }, { merge: true });
      setSaved(true);
      setMessage("Settings saved to Firebase successfully.");
      setMessageType("success");
    } catch (error) {
      setSaved(false);
      setMessage(error.code === "permission-denied"
        ? "Permission denied. Verify that the latest Firestore rules are published and your user profile has role ADMIN and active true."
        : error.message || "Could not save settings to Firebase.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      setMessage("Please fill all password fields.");
      setMessageType("error");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setMessage("New password and confirm password do not match.");
      setMessageType("error");
      return;
    }
    if (passwords.next.length < 6) {
      setMessage("New password must contain at least 6 characters.");
      setMessageType("error");
      return;
    }
    try {
      const currentUser = auth.currentUser;
      if (!currentUser?.email) throw new Error("Please sign in again to change your password.");
      const credential = EmailAuthProvider.credential(currentUser.email, passwords.current);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwords.next);
      setPasswords({ current: "", next: "", confirm: "" });
      setMessage("Firebase password updated successfully.");
      setMessageType("success");
    } catch (error) {
      const friendly = {
        "auth/invalid-credential": "Current password is incorrect.",
        "auth/wrong-password": "Current password is incorrect.",
        "auth/weak-password": "Choose a stronger password.",
        "auth/requires-recent-login": "Please log out, log in again, and retry changing your password.",
      };
      setMessage(friendly[error.code] || error.message || "Could not update password.");
      setMessageType("error");
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Administration</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your admin profile, company information and preferences.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saved ? <Check size={17} /> : <Save size={17} />}
          {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
        </button>
      </div>
      {message && (
        <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${messageType === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {message}
        </div>
      )}
      {loading && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading settings from Firebase...</div>}

      <section className={sectionClass}>
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <User size={19} className="text-slate-700" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Admin Profile</h2>
            <p className="text-xs text-slate-500">Basic administrator information. The email here is a profile contact field; it does not change your Firebase login email.</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Full Name" value={settings.profile.name} onChange={(v) => updateSection("profile", "name", v)} />
          <Field label="Email Address" icon={Mail} type="email" value={settings.profile.email} onChange={(v) => updateSection("profile", "email", v)} />
          <Field label="Phone Number" icon={Phone} value={settings.profile.phone} onChange={(v) => updateSection("profile", "phone", v)} placeholder="Enter phone number" />
          <Field label="Designation" value={settings.profile.designation} onChange={(v) => updateSection("profile", "designation", v)} />
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <Building2 size={19} className="text-slate-700" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Company Information</h2>
            <p className="text-xs text-slate-500">Information used across the Pareek system.</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Company Name" value={settings.company.name} onChange={(v) => updateSection("company", "name", v)} />
          <Field label="Legal Name" value={settings.company.legalName} onChange={(v) => updateSection("company", "legalName", v)} />
          <Field label="Company Email" icon={Mail} type="email" value={settings.company.email} onChange={(v) => updateSection("company", "email", v)} />
          <Field label="Company Phone" icon={Phone} value={settings.company.phone} onChange={(v) => updateSection("company", "phone", v)} />
          <Field label="GST Number" value={settings.company.gst} onChange={(v) => updateSection("company", "gst", v)} />
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Address</span>
            <textarea
              rows={3}
              value={settings.company.address}
              onChange={(e) => updateSection("company", "address", e.target.value)}
              placeholder="Enter company address"
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <Bell size={19} className="text-slate-700" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Notifications</h2>
            <p className="text-xs text-slate-500">Choose which operational notifications are enabled.</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            ["newOrder", "New Order", "Receive a notification when a new order is placed."],
            ["orderStatus", "Order Status", "Notify when an order status changes."],
            ["dealerUpdates", "Dealer Updates", "Receive updates related to dealers."],
            ["salespersonUpdates", "Salesperson Updates", "Receive updates related to salespersons."],
            ["whatsapp", "WhatsApp Notifications", "Enable WhatsApp notification preferences for future API integration."],
          ].map(([key, title, description]) => (
            <div key={key} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{description}</p>
              </div>
              <Toggle checked={settings.notifications[key]} onChange={(v) => updateSection("notifications", key, v)} />
            </div>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <ShieldCheck size={19} className="text-slate-700" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Security</h2>
            <p className="text-xs text-slate-500">Change your administrator password.</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="grid gap-5 md:grid-cols-3">
          {[
            ["current", "Current Password"],
            ["next", "New Password"],
            ["confirm", "Confirm Password"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <div className="relative">
                <LockKeyhole size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPasswords ? "text" : "password"}
                  value={passwords[key]}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, [key]: e.target.value }))}
                  className={`${inputClass} pl-10 pr-10`}
                />
                {key === "confirm" && (
                  <button
                    type="button"
                    onClick={() => setShowPasswords((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPasswords ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                )}
              </div>
            </label>
          ))}
          <div className="md:col-span-3">
            <button type="submit" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Update Password
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
