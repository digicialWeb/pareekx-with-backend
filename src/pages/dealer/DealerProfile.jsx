import {
  Building2,
  Check,
  Edit3,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "pareekx_dealer_profile";
const DEFAULT_PROFILE = {
  name: "Shree Balaji Traders",
  contactPerson: "Rajesh Kumar",
  phone: "+91 98765 43210",
  email: "dealer@pareekx.com",
  businessName: "Shree Balaji Traders",
  address: "GE Road, Near Telibandha",
  city: "Raipur",
  state: "Chhattisgarh",
  pincode: "492001",
  gst: "22ABCDE1234F1Z5",
};
const DEFAULT_PASSWORD = { current: "", next: "", confirm: "" };
const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#B5220E] focus:ring-4 focus:ring-[#B5220E]/10";

function Field({
  label,
  value,
  onChange,
  icon: Icon,
  type = "text",
  placeholder,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`${inputClass} ${Icon ? "pl-11" : ""} ${disabled ? "cursor-not-allowed bg-slate-50 text-slate-500" : ""}`}
        />
      </div>
    </label>
  );
}
function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#B5220E]/10 text-[#B5220E]">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export default function DealerProfile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE),
    [draft, setDraft] = useState(DEFAULT_PROFILE),
    [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [editing, setEditing] = useState(false),
    [showPassword, setShowPassword] = useState(false),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (stored && typeof stored === "object") {
        const merged = { ...DEFAULT_PROFILE, ...stored };
        setProfile(merged);
        setDraft(merged);
      }
    } catch {}
  }, []);
  const initials = useMemo(
    () =>
      profile.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join(""),
    [profile.name],
  );
  const updateDraft = (field, value) => {
    setDraft((c) => ({ ...c, [field]: value }));
    setSaved(false);
  };
  const startEditing = () => {
    setDraft(profile);
    setSaved(false);
    setEditing(true);
  };
  const cancelEditing = () => {
    setDraft(profile);
    setEditing(false);
    setSaved(false);
  };
  const saveProfile = (e) => {
    e.preventDefault();
    if (
      !draft.name.trim() ||
      !draft.phone.trim() ||
      !draft.city.trim() ||
      !draft.state.trim() ||
      !draft.pincode.trim()
    ) {
      alert("Please fill all required profile fields.");
      return;
    }
    const cleaned = {
      ...draft,
      name: draft.name.trim(),
      contactPerson: draft.contactPerson.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      businessName: draft.businessName.trim(),
      address: draft.address.trim(),
      city: draft.city.trim(),
      state: draft.state.trim(),
      pincode: draft.pincode.trim(),
      gst: draft.gst.trim().toUpperCase(),
    };
    setProfile(cleaned);
    setDraft(cleaned);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (u && typeof u === "object")
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...u,
            name: cleaned.name,
            email: cleaned.email,
            phone: cleaned.phone,
            dealerName: cleaned.businessName || cleaned.name,
          }),
        );
    } catch {}
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };
  const updatePassword = (field, value) =>
    setPassword((c) => ({ ...c, [field]: value }));
  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!password.current || !password.next || !password.confirm) {
      alert("Please fill all password fields.");
      return;
    }
    if (password.next.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }
    if (password.next !== password.confirm) {
      alert("New password and confirm password do not match.");
      return;
    }
    alert("Password updated successfully in demo mode.");
    setPassword(DEFAULT_PASSWORD);
  };
  return (
    <div className="min-h-screen bg-[#F5F0EB] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#B5220E]">
              Dealer Portal
            </p>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              My Profile
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your dealer information and account security.
            </p>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B5220E] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#981d0c]"
            >
              <Edit3 size={17} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600"
              >
                <X size={17} />
                Cancel
              </button>
              <button
                type="submit"
                form="dealer-profile-form"
                className="inline-flex items-center gap-2 rounded-xl bg-[#B5220E] px-5 py-3 text-sm font-bold text-white"
              >
                <Save size={17} />
                Save Changes
              </button>
            </div>
          )}
        </div>
        {saved && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
              <Check size={16} />
            </span>
            Profile changes saved successfully.
          </div>
        )}
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-[#B5220E] to-[#D75A43]" />
          <div className="-mt-10 px-5 pb-6 md:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-[#B5220E] text-2xl font-black text-white shadow-lg">
                  {initials || "D"}
                </div>
                <div className="pb-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    {profile.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {profile.email || "No email added"}
                  </p>
                </div>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active Account
              </span>
            </div>
          </div>
        </div>
        <form id="dealer-profile-form" onSubmit={saveProfile}>
          <section className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
            <SectionHeader
              icon={User}
              title="Personal Information"
              description="Basic contact details associated with your dealer account."
            />
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Dealer / Company Name"
                value={draft.name}
                onChange={(v) => updateDraft("name", v)}
                icon={Building2}
                placeholder="Enter dealer name"
                disabled={!editing}
              />
              <Field
                label="Contact Person"
                value={draft.contactPerson}
                onChange={(v) => updateDraft("contactPerson", v)}
                icon={User}
                placeholder="Enter contact person"
                disabled={!editing}
              />
              <Field
                label="Phone Number"
                value={draft.phone}
                onChange={(v) => updateDraft("phone", v)}
                icon={Phone}
                placeholder="+91 98765 43210"
                disabled={!editing}
              />
              <Field
                label="Email Address"
                type="email"
                value={draft.email}
                onChange={(v) => updateDraft("email", v)}
                icon={Mail}
                placeholder="dealer@example.com"
                disabled={!editing}
              />
              <Field
                label="Business Name"
                value={draft.businessName}
                onChange={(v) => updateDraft("businessName", v)}
                icon={Building2}
                placeholder="Enter business name"
                disabled={!editing}
              />
              <Field
                label="GST Number"
                value={draft.gst}
                onChange={(v) => updateDraft("gst", v)}
                icon={ShieldCheck}
                placeholder="22ABCDE1234F1Z5"
                disabled={!editing}
              />
            </div>
          </section>
          <section className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
            <SectionHeader
              icon={MapPin}
              title="Business Address"
              description="Your registered dealer address and location details."
            />
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">
                  Complete Address
                </span>
                <textarea
                  rows={4}
                  value={draft.address}
                  onChange={(e) => updateDraft("address", e.target.value)}
                  placeholder="Enter complete business address"
                  disabled={!editing}
                  className={`${inputClass} resize-none ${!editing ? "cursor-not-allowed bg-slate-50 text-slate-500" : ""}`}
                />
              </label>
              <Field
                label="City"
                value={draft.city}
                onChange={(v) => updateDraft("city", v)}
                icon={MapPin}
                placeholder="Raipur"
                disabled={!editing}
              />
              <Field
                label="State"
                value={draft.state}
                onChange={(v) => updateDraft("state", v)}
                icon={MapPin}
                placeholder="Chhattisgarh"
                disabled={!editing}
              />
              <Field
                label="Pincode"
                value={draft.pincode}
                onChange={(v) => updateDraft("pincode", v)}
                icon={MapPin}
                placeholder="492001"
                disabled={!editing}
              />
            </div>
          </section>
        </form>
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
          <SectionHeader
            icon={KeyRound}
            title="Security"
            description="Change your dealer portal password. This is frontend demo behavior until the backend is connected."
          />
          <form onSubmit={handlePasswordChange}>
            <div className="grid gap-5 md:grid-cols-3">
              <Field
                label="Current Password"
                type={showPassword ? "text" : "password"}
                value={password.current}
                onChange={(v) => updatePassword("current", v)}
                placeholder="Enter current password"
              />
              <Field
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={password.next}
                onChange={(v) => updatePassword("next", v)}
                placeholder="Minimum 6 characters"
              />
              <Field
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                value={password.confirm}
                onChange={(v) => updatePassword("confirm", v)}
                placeholder="Repeat new password"
              />
            </div>
            <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="h-4 w-4 accent-[#B5220E]"
                />
                Show password fields
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#B5220E] px-5 py-3 text-sm font-bold text-[#B5220E] transition hover:bg-[#B5220E] hover:text-white"
              >
                <KeyRound size={17} />
                Change Password
              </button>
            </div>
          </form>
        </section>
        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">
          <strong>Frontend mode:</strong> Profile information is saved in
          browser localStorage for now. Once Spring Boot is connected, these
          actions will use secure APIs and database persistence.
        </div>
      </div>
    </div>
  );
}
