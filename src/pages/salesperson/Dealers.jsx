import { useEffect, useMemo, useState } from "react";

import { getDealers, getDealersBySalesperson, saveDealers } from "../../data/pareekxStore";
import { upsertUser, getStoredUsers } from "../../utils/auth";



import {

  CheckCircle2,

  ExternalLink,

  Eye,

  Mail,

  MapPin,

  MessageCircle,

  Package,

  Phone,

  Plus,

  RotateCcw,

  Search,

  ShoppingBag,

  Users,

  X,

  XCircle,

} from "lucide-react";



const ORDER_HISTORY = [

  {

    id: "PRK-483921",



    dealerId: 1,



    product: "Premium Paint",



    shade: "Royal Blue",



    quantity: 120,



    status: "PENDING",



    date: "02 Oct 2026",

  },



  {

    id: "PRK-483712",



    dealerId: 1,



    product: "Interior Emulsion",



    shade: "Pearl White",



    quantity: 180,



    status: "DELIVERED",



    date: "28 Sep 2026",

  },



  {

    id: "PRK-483601",



    dealerId: 2,



    product: "Exterior Coat",



    shade: "Brick Red",



    quantity: 96,



    status: "DISPATCHED",



    date: "01 Oct 2026",

  },



  {

    id: "PRK-483455",



    dealerId: 3,



    product: "Premium Paint",



    shade: "Forest Green",



    quantity: 150,



    status: "DELIVERED",



    date: "30 Sep 2026",

  },

];



const STATUS_STYLES = {

  PENDING: "bg-amber-50 text-amber-700 border-amber-200",



  IN_PRODUCTION: "bg-blue-50 text-blue-700 border-blue-200",



  READY: "bg-emerald-50 text-emerald-700 border-emerald-200",



  DISPATCHED: "bg-purple-50 text-purple-700 border-purple-200",



  DELIVERED: "bg-green-50 text-green-700 border-green-200",

};



function StatusBadge({ active }) {

  return (

    <span

      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${

        active

          ? "border-emerald-200 bg-emerald-50 text-emerald-700"

          : "border-gray-200 bg-gray-100 text-gray-500"

      }`}

    >

      {active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}



      {active ? "Active" : "Inactive"}

    </span>

  );

}



function OrderStatus({ status }) {

  return (

    <span

      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${

        STATUS_STYLES[status] || "border-gray-200 bg-gray-100 text-gray-600"

      }`}

    >

      {status.replaceAll("_", " ")}

    </span>

  );

}



export default function Dealers() {

  const salespersonId = 1;



  const [dealers, setDealers] = useState(() =>

    getDealersBySalesperson(salespersonId),

  );

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [cityFilter, setCityFilter] = useState("ALL");

  const [selectedDealer, setSelectedDealer] = useState(null);



  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({

    name: "",

    contactPerson: "",

    phone: "",

    email: "",

    city: "",

    state: "Chhattisgarh",

    address: "",

    pincode: "",

    gst: "",

    password: "",

  });



  useEffect(() => {

    const refreshDealers = () => {

      setDealers(getDealersBySalesperson(salespersonId));

    };



    refreshDealers();

    window.addEventListener("pareekx-dealers-updated", refreshDealers);



    return () => {

      window.removeEventListener("pareekx-dealers-updated", refreshDealers);

    };

  }, [salespersonId]);



  const updateForm = (field, value) => {

    setForm((current) => ({ ...current, [field]: value }));

  };



  const closeAddModal = () => {

    setShowAddModal(false);

    setForm({

      name: "",

      contactPerson: "",

      phone: "",

      email: "",

      city: "",

      state: "Chhattisgarh",

      address: "",

      pincode: "",

      gst: "",

      password: "",

    });

  };



  const saveDealer = (event) => {

    event.preventDefault();



    if (

      !form.name.trim() ||

      !form.phone.trim() ||

      !form.city.trim() ||

      !form.pincode.trim()

    ) {

      alert("Please fill Dealer Name, Phone, City and Pincode.");

      return;

    }



    const allDealers = getDealers();

    const normalizedPhone = form.phone.replace(/\D/g, "");



    if (

      allDealers.some(

        (dealer) => dealer.phone?.replace(/\D/g, "") === normalizedPhone,

      )

    ) {

      alert("A dealer with this phone number already exists.");

      return;

    }



    const dealerData = {

      id: Date.now(),

      name: form.name.trim(),

      contactPerson: form.contactPerson.trim(),

      phone: form.phone.trim(),

      email: form.email.trim(),

      city: form.city.trim(),

      state: form.state.trim(),

      address: form.address.trim(),

      pincode: form.pincode.trim(),

      gst: form.gst.trim().toUpperCase(),

      salespersonId,

      active: true,

      joinedAt: new Date().toISOString().slice(0, 10),

      totalOrders: 0,

      totalQuantity: 0,

      lastOrder: "",

    };



    saveDealers([...allDealers, dealerData]);

    setDealers(getDealersBySalesperson(salespersonId));

    closeAddModal();

  };



  const cities = useMemo(

    () => [...new Set(dealers.map((dealer) => dealer.city))],



    [dealers],

  );



  const stats = useMemo(

    () => ({

      total: dealers.length,



      active: dealers.filter((dealer) => dealer.active).length,



      inactive: dealers.filter((dealer) => !dealer.active).length,



      orders: dealers.reduce(

        (total, dealer) => total + dealer.totalOrders,



        0,

      ),

    }),



    [dealers],

  );



  const filteredDealers = useMemo(() => {

    const query = search.trim().toLowerCase();



    return dealers.filter((dealer) => {

      const matchesSearch =

        !query ||

        dealer.name.toLowerCase().includes(query) ||

        dealer.contactPerson.toLowerCase().includes(query) ||

        dealer.phone.toLowerCase().includes(query) ||

        dealer.email.toLowerCase().includes(query) ||

        dealer.city.toLowerCase().includes(query);



      const matchesStatus =

        statusFilter === "ALL" ||

        (statusFilter === "ACTIVE" && dealer.active) ||

        (statusFilter === "INACTIVE" && !dealer.active);



      const matchesCity = cityFilter === "ALL" || dealer.city === cityFilter;



      return matchesSearch && matchesStatus && matchesCity;

    });

  }, [dealers, search, statusFilter, cityFilter]);



  const resetFilters = () => {

    setSearch("");



    setStatusFilter("ALL");



    setCityFilter("ALL");

  };



  const dealerOrders = selectedDealer

    ? ORDER_HISTORY.filter((order) => order.dealerId === selectedDealer.id)

    : [];



  return (

    <div className="min-h-screen bg-[#F5F0EB] p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-[1500px]">

        {/* Header */}



        <div className="mb-6">

          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#B5220E]">

            Salesperson Portal

          </p>



          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">

                My Dealers

              </h1>



              <p className="mt-1 text-sm text-slate-500">

                View and manage dealers assigned to you.

              </p>

            </div>



            <button

              type="button"

              onClick={() => setShowAddModal(true)}

              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B5220E] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#981d0c]"

            >

              <Plus size={18} />

              Add Dealer

            </button>

          </div>

        </div>



        {/* Stats */}



        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-4">

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-xs font-medium text-slate-500">

                Total Dealers

              </p>



              <Users size={18} className="text-slate-700" />

            </div>



            <p className="mt-2 text-2xl font-bold text-slate-900">

              {stats.total}

            </p>

          </div>



          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-xs font-medium text-slate-500">

                Active Dealers

              </p>



              <CheckCircle2 size={18} className="text-emerald-600" />

            </div>



            <p className="mt-2 text-2xl font-bold text-emerald-600">

              {stats.active}

            </p>

          </div>



          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-xs font-medium text-slate-500">Inactive</p>



              <XCircle size={18} className="text-slate-400" />

            </div>



            <p className="mt-2 text-2xl font-bold text-slate-600">

              {stats.inactive}

            </p>

          </div>



          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-xs font-medium text-slate-500">Total Orders</p>



              <ShoppingBag size={18} className="text-[#B5220E]" />

            </div>



            <p className="mt-2 text-2xl font-bold text-[#B5220E]">

              {stats.orders}

            </p>

          </div>

        </div>



        {/* Filters */}



        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search

                size={18}

                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"

              />



              <input

                type="text"

                value={search}

                onChange={(e) => setSearch(e.target.value)}

                placeholder="Search dealer, contact, phone or city..."

                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#B5220E] focus:bg-white focus:ring-4 focus:ring-[#B5220E]/10"

              />

            </div>



            <select

              value={statusFilter}

              onChange={(e) => setStatusFilter(e.target.value)}

              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#B5220E]"

            >

              <option value="ALL">All Status</option>



              <option value="ACTIVE">Active</option>



              <option value="INACTIVE">Inactive</option>

            </select>



            <select

              value={cityFilter}

              onChange={(e) => setCityFilter(e.target.value)}

              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#B5220E]"

            >

              <option value="ALL">All Cities</option>



              {cities.map((city) => (

                <option key={city} value={city}>

                  {city}

                </option>

              ))}

            </select>



            <button

              type="button"

              onClick={resetFilters}

              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"

            >

              <RotateCcw size={16} />

              Reset

            </button>

          </div>

        </div>



        {/* Dealer List */}



        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">

            <h2 className="font-bold text-slate-900">Assigned Dealers</h2>



            <p className="mt-1 text-xs text-slate-500">

              Showing {filteredDealers.length} of {dealers.length} dealers

            </p>

          </div>



          {/* Desktop */}



          <div className="hidden overflow-x-auto md:block">

            <table className="w-full min-w-[1050px] text-left">

              <thead className="bg-slate-50">

                <tr className="text-xs uppercase tracking-wide text-slate-500">

                  <th className="px-5 py-4 font-semibold">Dealer</th>



                  <th className="px-5 py-4 font-semibold">Contact</th>



                  <th className="px-5 py-4 font-semibold">Location</th>



                  <th className="px-5 py-4 font-semibold">Orders</th>



                  <th className="px-5 py-4 font-semibold">Quantity</th>



                  <th className="px-5 py-4 font-semibold">Status</th>



                  <th className="px-5 py-4 text-right font-semibold">Action</th>

                </tr>

              </thead>



              <tbody className="divide-y divide-slate-100">

                {filteredDealers.map((dealer) => (

                  <tr

                    key={dealer.id}

                    className="transition hover:bg-slate-50/70"

                  >

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#B5220E]/10 font-bold text-[#B5220E]">

                          {dealer.name.charAt(0).toUpperCase()}

                        </div>



                        <div>

                          <p className="font-bold text-slate-900">

                            {dealer.name}

                          </p>



                          <p className="mt-1 text-xs text-slate-500">

                            {dealer.contactPerson}

                          </p>

                        </div>

                      </div>

                    </td>



                    <td className="px-5 py-4">

                      <p className="flex items-center gap-2 text-sm text-slate-700">

                        <Phone size={14} />



                        {dealer.phone}

                      </p>



                      <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">

                        <Mail size={13} />



                        {dealer.email}

                      </p>

                    </td>



                    <td className="px-5 py-4">

                      <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700">

                        <MapPin size={14} />



                        {dealer.city}

                      </p>



                      <p className="mt-1 text-xs text-slate-400">

                        {dealer.state}

                      </p>

                    </td>



                    <td className="px-5 py-4">

                      <span className="font-bold text-slate-900">

                        {dealer.totalOrders}

                      </span>

                    </td>



                    <td className="px-5 py-4">

                      <span className="font-bold text-slate-900">

                        {dealer.totalQuantity}

                      </span>

                    </td>



                    <td className="px-5 py-4">

                      <StatusBadge active={dealer.active} />

                    </td>



                    <td className="px-5 py-4 text-right">

                      <button

                        type="button"

                        onClick={() => setSelectedDealer(dealer)}

                        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-[#B5220E] hover:text-white"

                      >

                        <Eye size={15} />

                        View

                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>



          {/* Mobile */}



          <div className="divide-y divide-slate-100 md:hidden">

            {filteredDealers.map((dealer) => (

              <div key={dealer.id} className="p-4">

                <div className="flex items-start justify-between gap-3">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#B5220E]/10 font-bold text-[#B5220E]">

                      {dealer.name.charAt(0).toUpperCase()}

                    </div>



                    <div>

                      <h3 className="font-bold text-slate-900">

                        {dealer.name}

                      </h3>



                      <p className="mt-1 text-xs text-slate-500">

                        {dealer.contactPerson}

                      </p>

                    </div>

                  </div>



                  <StatusBadge active={dealer.active} />

                </div>



                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">

                  <div className="rounded-xl bg-slate-50 p-3">

                    <p className="text-slate-400">Location</p>



                    <p className="mt-1 font-semibold text-slate-700">

                      {dealer.city}

                    </p>

                  </div>



                  <div className="rounded-xl bg-slate-50 p-3">

                    <p className="text-slate-400">Orders</p>



                    <p className="mt-1 font-semibold text-slate-700">

                      {dealer.totalOrders}

                    </p>

                  </div>

                </div>



                <button

                  type="button"

                  onClick={() => setSelectedDealer(dealer)}

                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#B5220E] px-4 py-3 text-sm font-bold text-white"

                >

                  <Eye size={16} />

                  View Dealer

                </button>

              </div>

            ))}

          </div>



          {filteredDealers.length === 0 && (

            <div className="px-6 py-16 text-center">

              <Users size={42} className="mx-auto text-slate-300" />



              <h3 className="mt-3 font-bold text-slate-800">

                No dealers found

              </h3>



              <p className="mt-1 text-sm text-slate-500">

                Try changing your search or filters.

              </p>

            </div>

          )}

        </div>

      </div>



      {/* Add Dealer Modal */}

      {showAddModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">

            <div className="flex items-start justify-between border-b border-slate-100 p-5 md:p-6">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B5220E]">

                  Dealer Management

                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">

                  Add New Dealer

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  The dealer will automatically be assigned to you.

                </p>

              </div>

              <button

                type="button"

                onClick={closeAddModal}

                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100"

              >

                <X size={21} />

              </button>

            </div>



            <form

              onSubmit={saveDealer}

              className="max-h-[calc(94vh-110px)] overflow-y-auto p-5 md:p-6"

            >

              <div className="grid gap-4 md:grid-cols-2">

                {[

                  [

                    "name",

                    "Dealer / Company Name \*",

                    "e.g. Shree Balaji Traders",

                  ],

                  ["contactPerson", "Contact Person", "e.g. Rajesh Kumar"],

                  ["phone", "Phone Number \*", "+91 98765 43210"],

                  ["email", "Email", "dealer@example.com"],

                  ["city", "City \*", "Raipur"],

                  ["pincode", "Pincode \*", "492001"],

                  ["gst", "GST Number", "22ABCDE1234F1Z5"],

                ].map(([field, label, placeholder]) => (

                  <div key={field}>

                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">

                      {label}

                    </label>

                    <input

                      type={field === "email" ? "email" : "text"}

                      value={form[field]}

                      onChange={(e) => updateForm(field, e.target.value)}

                      placeholder={placeholder}

                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#B5220E] focus:bg-white focus:ring-4 focus:ring-[#B5220E]/10"

                    />

                  </div>

                ))}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#B5220E] focus:bg-white focus:ring-4 focus:ring-[#B5220E]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    State *
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => updateForm("state", e.target.value)}
                    placeholder="e.g. Chhattisgarh"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#B5220E] focus:bg-white focus:ring-4 focus:ring-[#B5220E]/10"
                  />
                </div>



                <div className="md:col-span-2">

                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">

                    Address

                  </label>

                  <textarea

                    rows={3}

                    value={form.address}

                    onChange={(e) => updateForm("address", e.target.value)}

                    placeholder="Complete dealer address"

                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#B5220E] focus:bg-white focus:ring-4 focus:ring-[#B5220E]/10"

                  />

                </div>

              </div>



              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button

                  type="button"

                  onClick={closeAddModal}

                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"

                >

                  Cancel

                </button>

                <button

                  type="submit"

                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B5220E] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#981d0c]"

                >

                  <Plus size={17} />

                  Add Dealer

                </button>

              </div>

            </form>

          </div>

        </div>

      )}



      {/* Dealer Details Modal */}



      {selectedDealer && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* Modal Header */}



            <div className="flex items-start justify-between border-b border-slate-100 p-5 md:p-6">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-[#B5220E]">

                  Dealer Details

                </p>



                <h2 className="mt-1 text-xl font-bold text-slate-900">

                  {selectedDealer.name}

                </h2>



                <p className="mt-1 text-sm text-slate-500">

                  {selectedDealer.contactPerson}

                </p>

              </div>



              <button

                type="button"

                onClick={() => setSelectedDealer(null)}

                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"

              >

                <X size={21} />

              </button>

            </div>



            {/* Modal Body */}



            <div className="max-h-[calc(92vh-100px)] overflow-y-auto p-5 md:p-6">

              {/* Profile */}



              <div className="grid gap-5 md:grid-cols-2">

                <div className="rounded-2xl border border-slate-100 p-5">

                  <h3 className="mb-4 font-bold text-slate-900">

                    Contact Information

                  </h3>



                  <div className="space-y-4">

                    <div className="flex gap-3">

                      <Phone size={18} className="mt-0.5 text-[#B5220E]" />



                      <div>

                        <p className="text-xs text-slate-400">Phone</p>



                        <p className="mt-1 text-sm font-semibold text-slate-700">

                          {selectedDealer.phone}

                        </p>

                      </div>

                    </div>



                    <div className="flex gap-3">

                      <Mail size={18} className="mt-0.5 text-[#B5220E]" />



                      <div>

                        <p className="text-xs text-slate-400">Email</p>



                        <p className="mt-1 break-all text-sm font-semibold text-slate-700">

                          {selectedDealer.email}

                        </p>

                      </div>

                    </div>



                    <div className="flex gap-3">

                      <MapPin size={18} className="mt-0.5 text-[#B5220E]" />



                      <div>

                        <p className="text-xs text-slate-400">Address</p>



                        <p className="mt-1 text-sm font-semibold text-slate-700">

                          {selectedDealer.address}, {selectedDealer.city},{" "}

                          {selectedDealer.state} - {selectedDealer.pincode}

                        </p>

                      </div>

                    </div>

                  </div>



                  <div className="mt-5 flex flex-wrap gap-2">

                    <a

                      href={`tel:${selectedDealer.phone}`}

                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white"

                    >

                      <Phone size={15} />

                      Call

                    </a>



                    <a

                      href={`https\://wa.me/${selectedDealer.phone.replace(

                        /\D/g,



                        "",

                      )}`}

                      target="_blank"

                      rel="noreferrer"

                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-xs font-bold text-white"

                    >

                      <MessageCircle size={15} />

                      WhatsApp

                    </a>



                    <a

                      href={`mailto:${selectedDealer.email}`}

                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700"

                    >

                      <Mail size={15} />

                      Email

                    </a>

                  </div>

                </div>



                {/* Stats */}



                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <div className="rounded-2xl bg-slate-50 p-5">

                    <ShoppingBag size={20} className="text-[#B5220E]" />



                    <p className="mt-4 text-xs text-slate-500">Total Orders</p>



                    <p className="mt-1 text-2xl font-bold text-slate-900">

                      {selectedDealer.totalOrders}

                    </p>

                  </div>



                  <div className="rounded-2xl bg-slate-50 p-5">

                    <Package size={20} className="text-[#B5220E]" />



                    <p className="mt-4 text-xs text-slate-500">

                      Total Quantity

                    </p>



                    <p className="mt-1 text-2xl font-bold text-slate-900">

                      {selectedDealer.totalQuantity}

                    </p>

                  </div>



                  <div className="col-span-2 rounded-2xl bg-slate-50 p-5">

                    <p className="text-xs text-slate-500">Last Order</p>



                    <p className="mt-1 font-bold text-slate-900">

                      {selectedDealer.lastOrder || "No orders yet"}

                    </p>



                    <div className="mt-3">

                      <StatusBadge active={selectedDealer.active} />

                    </div>

                  </div>

                </div>

              </div>



              {/* Recent Orders */}



              <div className="mt-6 rounded-2xl border border-slate-100">

                <div className="border-b border-slate-100 p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="font-bold text-slate-900">

                        Recent Orders

                      </h3>



                      <p className="mt-1 text-xs text-slate-500">

                        Orders placed by this dealer.

                      </p>

                    </div>



                    <ExternalLink size={18} className="text-slate-400" />

                  </div>

                </div>



                {dealerOrders.length > 0 ? (

                  <div className="divide-y divide-slate-100">

                    {dealerOrders.map((order) => (

                      <div

                        key={order.id}

                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"

                      >

                        <div>

                          <p className="font-bold text-slate-800">{order.id}</p>



                          <p className="mt-1 text-xs text-slate-500">

                            {order.product} • {order.shade}

                          </p>



                          <p className="mt-1 text-xs text-slate-400">

                            {order.date}

                          </p>

                        </div>



                        <div className="flex items-center gap-4">

                          <div className="text-right">

                            <p className="text-xs text-slate-400">Quantity</p>



                            <p className="font-bold text-slate-800">

                              {order.quantity}

                            </p>

                          </div>



                          <OrderStatus status={order.status} />

                        </div>

                      </div>

                    ))}

                  </div>

                ) : (

                  <div className="p-8 text-center text-sm text-slate-500">

                    No recent orders found.

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
