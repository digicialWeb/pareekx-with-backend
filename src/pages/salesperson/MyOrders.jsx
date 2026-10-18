import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { getUser } from "../../utils/auth";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  MapPin,
  Package,
  RefreshCcw,
  Search,
  Truck,
  User,
  X,
} from "lucide-react";

const DEMO_ORDERS = [
  {
    id: "PRK-582941",
    dealer: {
      name: "Raipur Paint Centre",
      phone: "9876500011",
      city: "Raipur",
    },
    createdAt: "02 Oct 2026, 11:30 AM",
    status: "Pending",
    products: [
      {
        name: "Premium Interior Emulsion",
        shades: [
          {
            name: "Ivory White",
            packs: [
              { size: "4L", quantity: 12 },
              { size: "20L", quantity: 4 },
            ],
          },
          {
            name: "Pastel Blue",
            packs: [{ size: "10L", quantity: 6 }],
          },
        ],
      },
      {
        name: "Exterior Weather Shield",
        shades: [
          {
            name: "Stone Grey",
            packs: [{ size: "20L", quantity: 3 }],
          },
        ],
      },
    ],
    delivery: {
      type: "Transport",
      transport: "Shree Balaji Transport",
      route: "Raipur → Bilaspur",
    },
    remark: "Please dispatch the Ivory White packs first.",
  },
  {
    id: "PRK-417826",
    dealer: {
      name: "Sharma Hardware & Paints",
      phone: "9876500022",
      city: "Durg",
    },
    createdAt: "01 Oct 2026, 04:15 PM",
    status: "Processing",
    products: [
      {
        name: "Exterior Primer",
        shades: [
          {
            name: "White Base",
            packs: [
              { size: "4L", quantity: 10 },
              { size: "20L", quantity: 5 },
            ],
          },
        ],
      },
    ],
    delivery: {
      type: "Direct",
      transport: null,
      route: null,
    },
    remark: "Regular monthly requirement.",
  },
  {
    id: "PRK-309514",
    dealer: {
      name: "New Look Interiors",
      phone: "9876500033",
      city: "Bhilai",
    },
    createdAt: "28 Sep 2026, 10:05 AM",
    status: "Dispatched",
    products: [
      {
        name: "Texture Paint — Smooth",
        shades: [
          {
            name: "Sand Beige",
            packs: [{ size: "25kg", quantity: 8 }],
          },
          {
            name: "Cream",
            packs: [{ size: "10kg", quantity: 5 }],
          },
        ],
      },
    ],
    delivery: {
      type: "Transport",
      transport: "Mahadev Logistics",
      route: "Raipur → Nagpur",
    },
    remark: "Call dealer before delivery.",
  },
  {
    id: "PRK-198462",
    dealer: {
      name: "Raipur Paint Centre",
      phone: "9876500011",
      city: "Raipur",
    },
    createdAt: "25 Sep 2026, 02:20 PM",
    status: "Delivered",
    products: [
      {
        name: "Waterproof Coating",
        shades: [
          {
            name: "Standard",
            packs: [{ size: "20L", quantity: 10 }],
          },
        ],
      },
    ],
    delivery: {
      type: "Transport",
      transport: "Patel Transport",
      route: "Raipur → Bhopal",
    },
    remark: "Delivered successfully.",
  },
];

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Processing: "bg-violet-50 text-violet-700 border-violet-200",
  Dispatched: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_STEPS = [
  "Pending",
  "Confirmed",
  "Processing",
  "Dispatched",
  "Delivered",
];

function getTotalQuantity(order) {
  return order.products.reduce(
    (productTotal, product) =>
      productTotal +
      product.shades.reduce(
        (shadeTotal, shade) =>
          shadeTotal +
          shade.packs.reduce((packTotal, pack) => packTotal + Number(pack.quantity || 0), 0),
        0,
      ),
    0,
  );
}

function getProductLineCount(order) {
  return order.products.reduce(
    (total, product) =>
      total +
      product.shades.reduce((shadeTotal, shade) => shadeTotal + shade.packs.length, 0),
    0,
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B5220E]/5 text-[#B5220E]">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function normalizeFirestoreOrder(raw, index) {
  const createdValue = raw.createdAt || raw.date;
  const createdDate = typeof createdValue?.toDate === "function" ? createdValue.toDate() : (createdValue ? new Date(createdValue) : null);
  const products = Array.isArray(raw.products) ? raw.products.map((product) => ({
    name: product.productName || product.name || "Product",
    shades: (product.shades || []).map((shade) => ({
      name: shade.shade || shade.name || "Shade",
      packs: (shade.packs || []).map((pack) => ({ size: pack.packSize || pack.size || "—", quantity: Number(pack.quantity || 0) })),
    })),
  })) : [];
  const statusRaw = String(raw.status || "PENDING").toUpperCase().replace(/[ -]+/g, "_");
  const status = ({ PENDING: "Pending", CONFIRMED: "Confirmed", IN_PRODUCTION: "Processing", PROCESSING: "Processing", READY: "Ready", DISPATCHED: "Dispatched", DELIVERED: "Delivered" })[statusRaw] || "Pending";
  const deliveryType = String(raw.deliveryType || raw.delivery?.type || "DIRECT").toUpperCase();
  const dealer = typeof raw.dealer === "object" && raw.dealer ? raw.dealer : {};
  return {
    ...raw,
    id: raw.orderId || raw.id || `ORDER-${index + 1}`,
    dealer: { name: dealer.name || raw.dealerName || "Dealer", phone: dealer.phone || raw.dealerPhone || "", city: dealer.city || raw.city || "" },
    createdAt: createdDate && !Number.isNaN(createdDate.getTime()) ? createdDate.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently created",
    status,
    products,
    delivery: { type: deliveryType === "TRANSPORT" ? "Transport" : "Direct", transport: raw.transport || raw.delivery?.transport || null, route: raw.delivery?.route || null },
    remark: raw.remark || "",
  };
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid || getUser()?.uid || getUser()?.id;
    if (!uid) {
      setOrders([]);
      setLoading(false);
      setLoadError("Your login session could not be verified. Please sign in again.");
      return undefined;
    }
    const ordersQuery = query(collection(db, "orders"), where("salespersonUid", "==", uid));
    return onSnapshot(ordersQuery, (snapshot) => {
      const rows = snapshot.docs.map((item, index) => normalizeFirestoreOrder({ ...item.data(), firestoreId: item.id }, index));
      rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(rows);
      setLoadError("");
      setLoading(false);
    }, (error) => {
      console.error("Failed to load salesperson orders:", error);
      setLoadError(error.code === "permission-denied" ? "Firebase permission denied while loading your orders." : "Could not load orders. Please refresh and try again.");
      setLoading(false);
    });
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = status === "All" || order.status === status;
      if (!matchesStatus) return false;

      if (!query) return true;

      const productText = order.products
        .flatMap((product) => [
          product.name,
          ...product.shades.flatMap((shade) => [
            shade.name,
            ...shade.packs.map((pack) => pack.size),
          ]),
        ])
        .join(" ")
        .toLowerCase();

      return (
        order.id.toLowerCase().includes(query) ||
        order.dealer.name.toLowerCase().includes(query) ||
        productText.includes(query)
      );
    });
  }, [orders, search, status]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === "Pending").length,
      processing: orders.filter((order) => order.status === "Processing").length,
      dispatched: orders.filter((order) => order.status === "Dispatched").length,
      delivered: orders.filter((order) => order.status === "Delivered").length,
    }),
    [orders],
  );



  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track orders created for your dealers.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
          <RefreshCcw size={16} /> Live Firebase Orders
        </span>
      </div>

      {loadError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loadError}</div>}
      {loading && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading your orders from Firebase…</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Orders" value={stats.total} icon={Package} />
        <StatCard label="Pending" value={stats.pending} icon={Clock3} />
        <StatCard label="Processing" value={stats.processing} icon={RefreshCcw} />
        <StatCard label="Dispatched" value={stats.dispatched} icon={Truck} />
        <StatCard label="Delivered" value={stats.delivered} icon={Package} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Order ID, dealer, product or shade..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#B5220E] focus:ring-2 focus:ring-[#B5220E]/10"
            />
          </div>

          <div className="relative lg:w-56">
            <Filter
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#B5220E]"
            >
              <option value="All">All Status</option>
              {STATUS_STEPS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Package size={25} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-800">No Orders Found</h2>
          <p className="mt-1 text-sm text-slate-500">
            Try changing the search or status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-bold text-slate-900">{order.id}</h2>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <User size={15} /> {order.dealer.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={15} /> {order.dealer.city}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={15} /> {order.createdAt}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:flex sm:items-center">
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                    <p className="text-xs text-slate-400">Product Lines</p>
                    <p className="mt-0.5 font-bold text-slate-800">
                      {getProductLineCount(order)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                    <p className="text-xs text-slate-400">Total Qty</p>
                    <p className="mt-0.5 font-bold text-slate-800">
                      {getTotalQuantity(order)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#B5220E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#971c0b] sm:col-span-1"
                  >
                    <Eye size={16} />
                    View Details
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

function OrderDetailsModal({ order, onClose }) {
  const currentIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{order.id}</h2>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">Order details</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          >
            <X size={19} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Order Progress
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-5">
              {STATUS_STEPS.map((step, index) => (
                <div key={step} className="relative">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                      index <= currentIndex
                        ? "bg-[#B5220E] text-white"
                        : "bg-white text-slate-400 ring-1 ring-slate-200"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p
                    className={`mt-2 text-xs font-semibold ${
                      index <= currentIndex ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <InfoCard title="Dealer" icon={User}>
              <p className="font-semibold text-slate-900">{order.dealer.name}</p>
              <p className="mt-1 text-sm text-slate-500">{order.dealer.phone}</p>
              <p className="mt-1 text-sm text-slate-500">{order.dealer.city}</p>
            </InfoCard>

            <InfoCard title="Delivery" icon={Truck}>
              <p className="font-semibold text-slate-900">{order.delivery.type}</p>
              {order.delivery.transport && (
                <p className="mt-1 text-sm text-slate-500">
                  {order.delivery.transport}
                </p>
              )}
              {order.delivery.route && (
                <p className="mt-1 text-sm text-slate-500">{order.delivery.route}</p>
              )}
            </InfoCard>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="font-bold text-slate-900">Products</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {order.products.map((product, productIndex) => (
                <div key={`${product.name}-${productIndex}`} className="p-5">
                  <p className="font-semibold text-slate-900">{product.name}</p>

                  <div className="mt-3 space-y-3">
                    {product.shades.map((shade, shadeIndex) => (
                      <div
                        key={`${shade.name}-${shadeIndex}`}
                        className="rounded-xl bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs text-slate-400">Shade</p>
                            <p className="font-semibold text-slate-800">{shade.name}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {shade.packs.map((pack, packIndex) => (
                              <span
                                key={`${pack.size}-${packIndex}`}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                              >
                                {pack.size} × {pack.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <InfoCard title="Order Summary" icon={Package}>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Product lines</span>
                <span className="font-semibold text-slate-800">
                  {getProductLineCount(order)}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-slate-500">Total quantity</span>
                <span className="font-semibold text-slate-800">
                  {getTotalQuantity(order)}
                </span>
              </div>
            </InfoCard>

            <InfoCard title="Remark" icon={Clock3}>
              <p className="text-sm leading-6 text-slate-600">
                {order.remark || "No remark added."}
              </p>
            </InfoCard>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={17} className="text-[#B5220E]" />
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}
