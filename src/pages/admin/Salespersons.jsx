import { useEffect, useMemo, useState } from "react";
import { watchCollection, saveRecord } from "../../services/firebaseData";
import { createSalespersonAuthAccount } from "../../services/salespersonAccounts";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
  UserCheck,
  UserX,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Eye,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  employeeCode: "",
  city: "",
  state: "Chhattisgarh",
  joiningDate: "",
  active: true,
  password: "",
};

const STATUS_LABELS = {
  PENDING: "Pending",
  IN_PRODUCTION: "In Production",
  READY: "Ready",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
};

function formatDate(date) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    IN_PRODUCTION: "bg-blue-50 text-blue-700 border-blue-200",
    READY: "bg-emerald-50 text-emerald-700 border-emerald-200",
    DISPATCHED: "bg-purple-50 text-purple-700 border-purple-200",
    DELIVERED: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function UserStatus({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      <CheckCircle2 size={14} />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
      <UserX size={14} />
      Inactive
    </span>
  );
}

export default function Salespersons() {
  const [salespersons, setSalespersons] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let loaded = 0;
    const markLoaded = () => {
      loaded += 1;
      if (loaded >= 3) setLoading(false);
    };
    const handleError = (error) => {
      console.error("Failed to load salesperson data from Firestore", error);
      setLoadError(error?.code === "permission-denied"
        ? "Firestore permission denied. Publish the admin rules for users, salespersons, dealers, and orders."
        : error?.message || "Could not load data from Firebase.");
      markLoaded();
    };
    const unsubSalespersons = watchCollection("salespersons", (items) => {
      setSalespersons(items.map((item) => ({
        ...item,
        id: item.id,
        name: item.name || "",
        email: item.email || "",
        phone: item.phone || "",
        employeeCode: item.employeeCode || "",
        city: item.city || "",
        state: item.state || "",
        joiningDate: item.joiningDate || item.joinedAt || "",
        active: item.active !== false,
        assignedDealers: Array.isArray(item.assignedDealers) ? item.assignedDealers : [],
        totalOrders: Number(item.totalOrders || 0),
        pendingOrders: Number(item.pendingOrders || 0),
        deliveredOrders: Number(item.deliveredOrders || 0),
        totalQuantity: Number(item.totalQuantity || 0),
        lastOrder: item.lastOrder || "",
      })));
      setLoadError("");
      markLoaded();
    }, handleError);
    const unsubDealers = watchCollection("dealers", (items) => {
      setDealers(items.filter((item) => !item.deleted));
      markLoaded();
    }, handleError);
    const unsubOrders = watchCollection("orders", (items) => {
      setOrders(items);
      markLoaded();
    }, handleError);
    return () => { unsubSalespersons(); unsubDealers(); unsubOrders(); };
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingSalesperson, setEditingSalesperson] = useState(null);
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedDealerIds, setSelectedDealerIds] = useState([]);

  const cities = useMemo(
    () =>
      [...new Set(salespersons.map((person) => person.city).filter(Boolean))],
    [salespersons]
  );

  const stats = useMemo(
    () => ({
      total: salespersons.length,
      active: salespersons.filter((person) => person.active).length,
      inactive: salespersons.filter((person) => !person.active).length,
      totalOrders: salespersons.reduce(
        (sum, person) => sum + person.totalOrders,
        0
      ),
    }),
    [salespersons]
  );

  const filteredSalespersons = useMemo(() => {
    const query = search.trim().toLowerCase();

    return salespersons.filter((person) => {
      const matchesSearch =
        !query ||
        String(person.name || "").toLowerCase().includes(query) ||
        String(person.email || "").toLowerCase().includes(query) ||
        String(person.phone || "").toLowerCase().includes(query) ||
        String(person.employeeCode || "").toLowerCase().includes(query) ||
        String(person.city || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && person.active) ||
        (statusFilter === "INACTIVE" && !person.active);

      const matchesCity =
        cityFilter === "ALL" || person.city === cityFilter;

      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [salespersons, search, statusFilter, cityFilter]);

  const salespersonOrders = selectedSalesperson
    ? orders.filter((order) => String(order.salespersonUid || order.salespersonId || "") === String(selectedSalesperson.uid || selectedSalesperson.id))
    : [];

  const openAddModal = () => {
    setEditingSalesperson(null);
    setForm(EMPTY_FORM);
    setSelectedDealerIds([]);
    setShowModal(true);
  };

  const openEditModal = (person) => {
    setEditingSalesperson(person);

    setForm({
      name: person.name,
      email: person.email,
      phone: person.phone,
      employeeCode: person.employeeCode,
      city: person.city,
      state: person.state,
      joiningDate: person.joiningDate,
      active: person.active,
      password: "",
    });

    setSelectedDealerIds([...person.assignedDealers]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSalesperson(null);
  };

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleDealerSelection = (dealerId) => {
    setSelectedDealerIds((current) =>
      current.some((id) => String(id) === String(dealerId))
        ? current.filter((id) => String(id) !== String(dealerId))
        : [...current, dealerId]
    );
  };

  const saveSalesperson = async (event) => {
    event.preventDefault();
    if (saving) return;

    if (!form.name.trim()) {
      alert("Please enter salesperson name.");
      return;
    }

    if (!form.email.trim()) {
      alert("Please enter email.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Please enter phone number.");
      return;
    }

    if (!form.employeeCode.trim()) {
      alert("Please enter employee code.");
      return;
    }

    if (!editingSalesperson && !form.password.trim()) {
      alert("Please set a password for this salesperson.");
      return;
    }

    if (form.password && form.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    const duplicateEmail = salespersons.some(
      (person) =>
        person.email.toLowerCase() === form.email.trim().toLowerCase() &&
        String(person.id) !== String(editingSalesperson?.id)
    );

    if (duplicateEmail) {
      alert("A salesperson with this email already exists.");
      return;
    }

    const duplicateCode = salespersons.some(
      (person) =>
        person.employeeCode.toLowerCase() ===
          form.employeeCode.trim().toLowerCase() &&
        String(person.id) !== String(editingSalesperson?.id)
    );

    if (duplicateCode) {
      alert("This employee code already exists.");
      return;
    }

    if (editingSalesperson && form.email.trim().toLowerCase() !== String(editingSalesperson.email || "").toLowerCase()) {
      alert("Salesperson login email cannot be changed here. Use the existing email for this account.");
      return;
    }

    setSaving(true);
    try {
      let salespersonId = editingSalesperson?.id;
      if (!editingSalesperson) {
        salespersonId = await createSalespersonAuthAccount({
          email: form.email.trim(),
          password: form.password,
          name: form.name,
          active: form.active,
        });
      }

      const salespersonData = {
        uid: salespersonId,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        employeeCode: form.employeeCode.trim().toUpperCase(),
        city: form.city.trim(),
        state: form.state.trim(),
        joiningDate: form.joiningDate || editingSalesperson?.joiningDate || new Date().toISOString().slice(0, 10),
        active: Boolean(form.active),
        assignedDealers: selectedDealerIds.map(String),
        totalOrders: Number(editingSalesperson?.totalOrders || 0),
        pendingOrders: Number(editingSalesperson?.pendingOrders || 0),
        deliveredOrders: Number(editingSalesperson?.deliveredOrders || 0),
        totalQuantity: Number(editingSalesperson?.totalQuantity || 0),
        lastOrder: editingSalesperson?.lastOrder || "",
      };

      if (editingSalesperson) {
        await saveRecord("users", salespersonId, {
          name: salespersonData.name,
          active: salespersonData.active,
        });
      } else {
        await saveRecord("users", salespersonId, {
          uid: salespersonId,
          name: salespersonData.name,
          email: salespersonData.email,
          role: "SALESPERSON",
          active: salespersonData.active,
        });
      }
      await saveRecord("salespersons", salespersonId, salespersonData);
      closeModal();
      alert(editingSalesperson ? "Salesperson updated successfully in Firebase." : "Salesperson login account created and saved to Firebase successfully.");
    } catch (error) {
      console.error("Failed to save salesperson", error);
      const messages = {
        "auth/email-already-in-use": "This email already has a Firebase Authentication account.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "permission-denied": "Firestore permission denied. Publish the admin rules for users and salespersons, then try again.",
      };
      alert(messages[error?.code] || error?.message || "Could not save salesperson. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSalesperson = async (id) => {
    const person = salespersons.find((item) => String(item.id) === String(id));
    if (!person) return;
    try {
      const active = !person.active;
      await saveRecord("salespersons", id, { active });
      await saveRecord("users", person.uid || id, { active });
    } catch (error) {
      console.error("Failed to change salesperson status", error);
      alert(error?.message || "Could not update salesperson status.");
    }
  };

  const deleteSalesperson = async (id) => {
    const person = salespersons.find((item) => String(item.id) === String(id));
    if (!person) return;
    if (!window.confirm(`Deactivate "${person.name}"? The Firebase login will be marked inactive; historical records will be kept.`)) return;
    try {
      await saveRecord("salespersons", id, { active: false });
      await saveRecord("users", person.uid || id, { active: false });
      if (selectedSalesperson?.id === id) setSelectedSalesperson(null);
    } catch (error) {
      console.error("Failed to deactivate salesperson", error);
      alert(error?.message || "Could not deactivate salesperson.");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCityFilter("ALL");
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {loadError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</div>}
        {loading && <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">Loading salespersons from Firebase…</div>}
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#B5220E]">
              Pareek Admin
            </p>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Salespersons Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage salesperson accounts, assigned dealers and order performance.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B5220E] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#981d0c]"
          >
            <Plus size={18} />
            Add Salesperson
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Total Salespersons", stats.total, Users, "text-gray-900"],
            ["Active", stats.active, UserCheck, "text-emerald-600"],
            ["Inactive", stats.inactive, UserX, "text-gray-500"],
            ["Total Orders", stats.totalOrders, ShoppingBag, "text-[#B5220E]"],
          ].map(([label, value, Icon, color]) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <Icon size={18} className={color} />
              </div>
              <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, phone, employee code..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#B5220E] focus:bg-white focus:ring-2 focus:ring-[#B5220E]/10"
              />
            </div>

            <SelectFilter
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                ["ALL", "All Status"],
                ["ACTIVE", "Active"],
                ["INACTIVE", "Inactive"],
              ]}
              width="md:w-44"
            />

            <SelectFilter
              value={cityFilter}
              onChange={setCityFilter}
              options={[
                ["ALL", "All Cities"],
                ...cities.map((city) => [city, city]),
              ]}
              width="md:w-48"
            />

            <button
              onClick={resetFilters}
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-bold text-gray-900">Salesperson Directory</h2>
            <p className="text-xs text-gray-500">
              Showing {filteredSalespersons.length} of {salespersons.length} salespersons
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-4 font-semibold">Salesperson</th>
                  <th className="px-5 py-4 font-semibold">Contact</th>
                  <th className="px-5 py-4 font-semibold">Dealers</th>
                  <th className="px-5 py-4 font-semibold">Orders</th>
                  <th className="px-5 py-4 font-semibold">Quantity</th>
                  <th className="px-5 py-4 font-semibold">Last Order</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredSalespersons.map((person) => (
                  <tr key={person.id} className="transition hover:bg-gray-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B5220E]/5 font-bold text-[#B5220E]">
                          {person.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-bold text-gray-900">
                            {person.name}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-gray-400">
                            {person.employeeCode}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone size={14} className="text-gray-400" />
                        {person.phone}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <Mail size={14} className="text-gray-400" />
                        {person.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">
                        {person.assignedDealers.length}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        assigned dealers
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">
                        {person.totalOrders}
                      </p>
                      <p className="mt-1 text-xs text-amber-600">
                        {person.pendingOrders} pending
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">
                        {person.totalQuantity}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {person.deliveredOrders} delivered
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(person.lastOrder)}
                    </td>

                    <td className="px-5 py-4">
                      <UserStatus active={person.active} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedSalesperson(person)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        <button
                          onClick={() => openEditModal(person)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          onClick={() => toggleSalesperson(person.id)}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                            person.active
                              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {person.active ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          onClick={() => deleteSalesperson(person.id)}
                          className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSalespersons.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Users className="mx-auto text-gray-300" size={42} />
              <h3 className="mt-3 font-bold text-gray-800">
                No salespersons found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 p-5 md:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#B5220E]">
                  Team Management
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {editingSalesperson
                    ? "Edit Salesperson"
                    : "Add New Salesperson"}
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={21} />
              </button>
            </div>

            <form
              onSubmit={saveSalesperson}
              className="max-h-[calc(94vh-90px)] overflow-y-auto p-5 md:p-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Full Name"
                  required
                  value={form.name}
                  onChange={(value) => updateForm("name", value)}
                  placeholder="e.g. Rahul Sharma"
                />

                <Field
                  label="Employee Code"
                  required
                  value={form.employeeCode}
                  onChange={(value) => updateForm("employeeCode", value)}
                  placeholder="e.g. SP-005"
                />

                <Field
                  label="Email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(value) => updateForm("email", value)}
                  placeholder="salesperson@pareek.com"
                />

                <Field
                  label="Phone Number"
                  required
                  value={form.phone}
                  onChange={(value) => updateForm("phone", value)}
                  placeholder="+91 98765 43210"
                />

                <Field
                  label={editingSalesperson ? "New Password (optional)" : "Password"}
                  required={!editingSalesperson}
                  type="password"
                  value={form.password}
                  onChange={(value) => updateForm("password", value)}
                  placeholder={editingSalesperson ? "Leave blank to keep current password" : "Minimum 6 characters"}
                />

                <Field
                  label="City"
                  value={form.city}
                  onChange={(value) => updateForm("city", value)}
                  placeholder="Raipur"
                />

                <SelectField
                  label="State"
                  value={form.state}
                  onChange={(value) => updateForm("state", value)}
                  options={[
                    "Chhattisgarh",
                    "Madhya Pradesh",
                    "Maharashtra",
                    "Odisha",
                    "Jharkhand",
                    "Uttar Pradesh",
                    "Other",
                  ]}
                />

                <Field
                  label="Joining Date"
                  type="date"
                  value={form.joiningDate}
                  onChange={(value) => updateForm("joiningDate", value)}
                />
              </div>

              {/* Dealer assignment */}
              <div className="mt-5 rounded-2xl border border-gray-100 p-5">
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900">
                    Assign Dealers
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Select dealers this salesperson will handle.
                  </p>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  {dealers.map((dealer) => {
                    const selected = selectedDealerIds.some((id) => String(id) === String(dealer.id));

                    return (
                      <button
                        key={dealer.id}
                        type="button"
                        onClick={() => toggleDealerSelection(dealer.id)}
                        className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-[#B5220E] bg-[#B5220E]/5"
                            : "border-gray-200 bg-gray-50 hover:bg-white"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {dealer.name}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                            <MapPin size={12} />
                            {dealer.city}
                          </p>
                        </div>

                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            selected
                              ? "border-[#B5220E] bg-[#B5220E] text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {selected && <CheckCircle2 size={14} />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-3 text-xs font-semibold text-gray-500">
                  {selectedDealerIds.length} dealer
                  {selectedDealerIds.length === 1 ? "" : "s"} selected
                </p>
              </div>

              <label className="mt-4 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    updateForm("active", event.target.checked)
                  }
                  className="h-4 w-4 accent-[#B5220E]"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Salesperson account is active
                </span>
              </label>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#B5220E] px-6 py-3 text-sm font-bold text-white hover:bg-[#981d0c]"
                >
                  {editingSalesperson
                    ? "Update Salesperson"
                    : "Save Salesperson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedSalesperson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 p-5 md:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#B5220E]">
                  Salesperson Profile
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {selectedSalesperson.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedSalesperson.employeeCode}
                </p>
              </div>

              <button
                onClick={() => setSelectedSalesperson(null)}
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={21} />
              </button>
            </div>

            <div className="max-h-[calc(92vh-90px)] overflow-y-auto p-5 md:p-6">
              {/* Profile + contact */}
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#B5220E]/5 text-xl font-bold text-[#B5220E]">
                      {selectedSalesperson.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">
                        {selectedSalesperson.name}
                      </h3>
                      <p className="mt-1 text-xs text-gray-400">
                        Joined {formatDate(selectedSalesperson.joiningDate)}
                      </p>
                      <div className="mt-2">
                        <UserStatus active={selectedSalesperson.active} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <InfoRow
                      icon={Mail}
                      label="Email"
                      value={selectedSalesperson.email}
                    />
                    <InfoRow
                      icon={Phone}
                      label="Phone"
                      value={selectedSalesperson.phone}
                    />
                    <InfoRow
                      icon={MapPin}
                      label="Location"
                      value={`${selectedSalesperson.city || "—"}, ${
                        selectedSalesperson.state || "—"
                      }`}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 p-5">
                  <h3 className="mb-4 font-bold text-gray-900">
                    Assigned Dealers
                  </h3>

                  {selectedSalesperson.assignedDealers.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSalesperson.assignedDealers.map((dealerId) => {
                        const dealer = dealers.find(
                          (item) => String(item.id) === String(dealerId)
                        );

                        if (!dealer) return null;

                        return (
                          <div
                            key={dealer.id}
                            className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
                          >
                            <div>
                              <p className="text-sm font-bold text-gray-800">
                                {dealer.name}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {dealer.city}
                              </p>
                            </div>

                            <span className="rounded-full bg-[#B5220E]/5 px-2.5 py-1 text-xs font-semibold text-[#B5220E]">
                              Assigned
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                      No dealers assigned.
                    </div>
                  )}
                </div>
              </div>

              {/* Performance */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-5">
                <DetailCard
                  label="Total Orders"
                  value={selectedSalesperson.totalOrders}
                />
                <DetailCard
                  label="Pending"
                  value={selectedSalesperson.pendingOrders}
                />
                <DetailCard
                  label="Delivered"
                  value={selectedSalesperson.deliveredOrders}
                />
                <DetailCard
                  label="Total Quantity"
                  value={selectedSalesperson.totalQuantity}
                />
                <DetailCard
                  label="Last Order"
                  value={formatDate(selectedSalesperson.lastOrder)}
                />
              </div>

              {/* Recent orders */}
              <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h3 className="font-bold text-gray-900">Recent Orders</h3>
                  <p className="text-xs text-gray-500">
                    Orders created by this salesperson.
                  </p>
                </div>

                {salespersonOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left">
                      <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-5 py-3">Order</th>
                          <th className="px-5 py-3">Dealer</th>
                          <th className="px-5 py-3">Date</th>
                          <th className="px-5 py-3">Quantity</th>
                          <th className="px-5 py-3">Status</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {salespersonOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-5 py-3 font-bold text-gray-800">
                              {order.orderNumber || order.id}
                            </td>
                            <td className="px-5 py-3 text-sm text-gray-600">
                              {order.dealerName || order.dealer || "—"}
                            </td>
                            <td className="px-5 py-3 text-sm text-gray-600">
                              {formatDate(order.date || order.createdAt?.toDate?.().toISOString?.().slice(0, 10))}
                            </td>
                            <td className="px-5 py-3 text-sm font-bold text-gray-800">
                              {order.quantity ?? order.totalQuantity ?? 0}
                            </td>
                            <td className="px-5 py-3">
                              <StatusBadge status={order.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-5 py-10 text-center text-sm text-gray-500">
                    No recent orders available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-[#B5220E]">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#B5220E] focus:bg-white focus:ring-2 focus:ring-[#B5220E]/10"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm outline-none focus:border-[#B5220E] focus:bg-white"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </label>
  );
}

function SelectFilter({ value, onChange, options, width }) {
  return (
    <div className={`relative ${width}`}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm font-medium outline-none focus:border-[#B5220E]"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={17} className="mt-0.5 shrink-0 text-gray-400" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 font-bold text-gray-800">{value}</p>
    </div>
  );
}
