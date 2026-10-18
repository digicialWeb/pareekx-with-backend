import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CalendarDays,
  Users,
  ShoppingCart,
  Pencil,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

const DEFAULT_PROFILE = {
  name: "Rahul Sharma",
  email: "salesperson@pareekx.com",
  phone: "+91 98765 43210",
  employeeId: "SP-1001",
  designation: "Salesperson",
  department: "Sales",
  city: "Raipur",
  state: "Chhattisgarh",
  joiningDate: "15 Jan 2025",
};

const STATS = {
  dealers: 18,
  orders: 126,
  pendingOrders: 9,
  deliveredOrders: 98,
};

const Profile = () => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [formData, setFormData] = useState(DEFAULT_PROFILE);

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedProfile = localStorage.getItem("salespersonProfile");

    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        setFormData(parsedProfile);
      } catch {
        setProfile(DEFAULT_PROFILE);
        setFormData(DEFAULT_PROFILE);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setFormData(profile);
    setIsEditing(true);
    setMessage("");
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setMessage("");
  };

  const handleSave = () => {
    localStorage.setItem(
      "salespersonProfile",
      JSON.stringify(formData)
    );

    setProfile(formData);
    setFormData(formData);
    setIsEditing(false);
    setMessage("Profile updated successfully.");

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
      setMessage("New password must contain at least 6 characters.");
      return;
    }

    if (
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      setMessage("New password and confirm password do not match.");
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
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal and employee information
          </p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B5220E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#991d0c]"
          >
            <Pencil size={17} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <X size={17} />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-[#B5220E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#991d0c]"
            >
              <Save size={17} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Success / Error Message */}
      {message && (
        <div className="rounded-xl border border-[#B5220E]/20 bg-[#B5220E]/5 px-4 py-3 text-sm font-medium text-[#B5220E]">
          {message}
        </div>
      )}

      {/* Profile Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#B5220E]/10 text-[#B5220E]">
              <User size={42} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              {profile.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {profile.designation}
            </p>

            <div className="mt-4 rounded-full bg-green-50 px-4 py-1.5 text-xs font-semibold text-green-700">
              Active
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <Mail size={17} className="text-slate-600" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-400">Email</p>
                <p className="truncate text-sm font-medium text-slate-700">
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <Phone size={17} className="text-slate-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="text-sm font-medium text-slate-700">
                  {profile.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <MapPin size={17} className="text-slate-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">Location</p>
                <p className="text-sm font-medium text-slate-700">
                  {profile.city}, {profile.state}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Assigned Dealers
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {STATS.dealers}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Users size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Orders
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {STATS.orders}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <ShoppingCart size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Pending Orders
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {STATS.pendingOrders}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <ShoppingCart size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Delivered Orders
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {STATS.deliveredOrders}
                </p>
              </div>

              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <ShoppingCart size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your basic personal and contact information
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full Name
            </label>

            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
              />
            ) : (
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {profile.name}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email Address
            </label>

            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {profile.email}
            </div>

            {isEditing && (
              <p className="mt-1 text-xs text-slate-400">
                Email cannot be changed from profile.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Phone Number
            </label>

            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputClass}
              />
            ) : (
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {profile.phone}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              City
            </label>

            {isEditing ? (
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={inputClass}
              />
            ) : (
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {profile.city}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              State
            </label>

            {isEditing ? (
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={inputClass}
              />
            ) : (
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {profile.state}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employee Information */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Employee Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Company and employment details
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-500">
              <Briefcase size={17} />
              <span className="text-xs font-medium">
                Employee ID
              </span>
            </div>

            <p className="text-sm font-bold text-slate-800">
              {profile.employeeId}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-500">
              <User size={17} />
              <span className="text-xs font-medium">
                Designation
              </span>
            </div>

            <p className="text-sm font-bold text-slate-800">
              {profile.designation}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-500">
              <Briefcase size={17} />
              <span className="text-xs font-medium">
                Department
              </span>
            </div>

            <p className="text-sm font-bold text-slate-800">
              {profile.department}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-500">
              <CalendarDays size={17} />
              <span className="text-xs font-medium">
                Joining Date
              </span>
            </div>

            <p className="text-sm font-bold text-slate-800">
              {profile.joiningDate}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3">
              <Lock size={20} className="text-slate-700" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Change Password
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update your account password
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handlePasswordChange}
          className="grid gap-5 md:grid-cols-3"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Current Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className={`${inputClass} pr-12`}
                placeholder="Current password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              New Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              className={inputClass}
              placeholder="New password"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Confirm Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              className={inputClass}
              placeholder="Confirm password"
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
    </div>
  );
};

export default Profile;