import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  MessageCircle,
  Lock,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

const DEFAULT_SETTINGS = {
  orderNotifications: true,
  whatsappNotifications: true,
  dealerNotifications: true,
  orderStatusNotifications: true,
};

const Settings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedSettings = localStorage.getItem(
      "salespersonSettings"
    );

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem(
      "salespersonSettings",
      JSON.stringify(settings)
    );

    setMessage("Settings saved successfully.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setMessage("Please fill all password fields.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setMessage(
        "New password and confirm password do not match."
      );
      return;
    }

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setMessage("Password changed successfully.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#B5220E] focus:ring-2 focus:ring-[#B5220E]/10";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#B5220E]/10 p-3 text-[#B5220E]">
              <SettingsIcon size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Settings
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your notification and account preferences
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B5220E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#991d0c]"
          >
            <Save size={17} />
            Save Settings
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="rounded-xl border border-[#B5220E]/20 bg-[#B5220E]/5 px-4 py-3 text-sm font-medium text-[#B5220E]">
          {message}
        </div>
      )}

      {/* Notifications */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Bell size={21} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Notifications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose which notifications you want to receive
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Order Notifications */}
          <div className="flex items-center justify-between gap-4 py-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                New Order Notifications
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Get notified when a dealer places a new order
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                handleToggle("orderNotifications")
              }
              className={`relative h-6 w-11 rounded-full transition ${
                settings.orderNotifications
                  ? "bg-[#B5220E]"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                  settings.orderNotifications
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center justify-between gap-4 py-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-50 p-2 text-green-600">
                <MessageCircle size={18} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  WhatsApp Notifications
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Receive order updates through WhatsApp
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handleToggle("whatsappNotifications")
              }
              className={`relative h-6 w-11 rounded-full transition ${
                settings.whatsappNotifications
                  ? "bg-[#B5220E]"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                  settings.whatsappNotifications
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Dealer Notifications */}
          <div className="flex items-center justify-between gap-4 py-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Dealer Notifications
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Receive updates related to your assigned dealers
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                handleToggle("dealerNotifications")
              }
              className={`relative h-6 w-11 rounded-full transition ${
                settings.dealerNotifications
                  ? "bg-[#B5220E]"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                  settings.dealerNotifications
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Order Status */}
          <div className="flex items-center justify-between gap-4 py-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Order Status Updates
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Get updates when orders change status
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                handleToggle("orderStatusNotifications")
              }
              className={`relative h-6 w-11 rounded-full transition ${
                settings.orderStatusNotifications
                  ? "bg-[#B5220E]"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                  settings.orderStatusNotifications
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Account Security */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
            <Lock size={21} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Account Security
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Change your account password
            </p>
          </div>
        </div>

        <form
          onSubmit={handlePasswordChange}
          className="grid gap-5 md:grid-cols-3"
        >
          {/* Current Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Current Password
            </label>

            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="Current password"
                className={`${inputClass} pr-12`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => !prev)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPasswords ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              New Password
            </label>

            <input
              type={showPasswords ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              placeholder="New password"
              className={inputClass}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Confirm Password
            </label>

            <input
              type={showPasswords ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder="Confirm password"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Lock size={17} />
              Change Password
            </button>
          </div>
        </form>
      </div>

      {/* Account Information */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Account Information
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Current account details
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              Account Type
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              Salesperson
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              Account Status
            </p>

            <p className="mt-1 text-sm font-semibold text-green-600">
              Active
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              Company
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              PareekX
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              Role
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              SALESPERSON
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;