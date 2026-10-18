import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { getUser } from "../../utils/auth";
import {
  Search,
  Filter,
  Eye,
  X,
  Package,
  Truck,
  CheckCircle2,
  Factory,
  Clock3,
  RefreshCw,
  MapPin,
  Phone,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

const INITIAL_ORDERS = [
  {
    id: "PRK-104823",
    createdAt: "02 Oct 2026, 12:05 PM",
    status: "READY",
    deliveryType: "TRANSPORT",
    transport: "Agarwal Logistics",
    remark: "",
    items: [
      { product: "Exterior Guard", shade: "Brick Red", packSize: "20 L", quantity: 20 },
      { product: "Exterior Guard", shade: "Brick Red", packSize: "10 L", quantity: 10 },
    ],
  },
  {
    id: "PRK-104825",
    createdAt: "30 Sep 2026, 02:10 PM",
    status: "DELIVERED",
    deliveryType: "DIRECT",
    transport: "",
    remark: "Delivered successfully.",
    items: [
      { product: "Luxury Emulsion", shade: "Magnolia", packSize: "20 L", quantity: 10 },
    ],
  },
  {
    id: "PRK-104826",
    createdAt: "29 Sep 2026, 11:20 AM",
    status: "IN_PRODUCTION",
    deliveryType: "TRANSPORT",
    transport: "Shree Ganesh Transport",
    remark: "Please dispatch at the earliest.",
    items: [
      { product: "Premium Interior Paint", shade: "Pearl White", packSize: "20 L", quantity: 12 },
      { product: "Premium Interior Paint", shade: "Sky Blue", packSize: "10 L", quantity: 8 },
    ],
  },
  {
    id: "PRK-104827",
    createdAt: "27 Sep 2026, 04:45 PM",
    status: "PENDING",
    deliveryType: "DIRECT",
    transport: "",
    remark: "Call before preparing the order.",
    items: [
      { product: "Exterior Weather Shield", shade: "Off White", packSize: "20 L", quantity: 6 },
    ],
  },
];

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock3,
  },
  IN_PRODUCTION: {
    label: "In Production",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Factory,
  },
  READY: {
    label: "Ready",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  DISPATCHED: {
    label: "Dispatched",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: Package,
  },
};

const STATUS_FLOW = [
  "PENDING",
  "IN_PRODUCTION",
  "READY",
  "DISPATCHED",
  "DELIVERED",
];

function normalizeOrder(order, index) {
  const dealer = order.dealer || {};
  const rawItems = Array.isArray(order.items) ? order.items : [];

  const items = rawItems.length
    ? rawItems
    : Array.isArray(order.products)
      ? order.products.flatMap((product) =>
          (product.shades || []).flatMap((shade) =>
            (shade.packs || []).map((pack) => ({
              product: product.productName || product.name || "Product",
              shade: shade.shade || "Shade",
              packSize: pack.packSize || "-",
              quantity: Number(pack.quantity || 0),
            })),
          ),
        )
      : [];

  const createdValue = order.createdAt || order.date;
  const createdDate = typeof createdValue?.toDate === "function" ? createdValue.toDate() : (createdValue ? new Date(createdValue) : null);
  const rawStatusValue = String(order.status || "PENDING").toUpperCase().replace(/[ -]+/g, "_");
  const rawStatus = rawStatusValue === "PROCESSING" ? "IN_PRODUCTION" : rawStatusValue;
  return {
    ...order,
    id: order.orderId || order.id || `PRK-${String(index + 1).padStart(6, "0")}`,
    createdAt: createdDate && !Number.isNaN(createdDate.getTime()) ? createdDate.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently created",
    status: rawStatus,
    deliveryType: order.deliveryType || order.delivery?.type || "DIRECT",
    transport: order.transport || order.delivery?.transport?.name || order.delivery?.transport || "",
    remark: order.remark || "",
    dealer,
    items,
  };
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}

function totalQuantity(order) {
  return order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const uid = auth.currentUser?.uid || getUser()?.uid || getUser()?.id;
    if (!uid) {
      setOrders([]);
      setLoading(false);
      setLoadError("Your login session could not be verified. Please sign in again.");
      return undefined;
    }
    const ordersQuery = query(collection(db, "orders"), where("dealerUid", "==", uid));
    return onSnapshot(ordersQuery, (snapshot) => {
      const rows = snapshot.docs.map((item, index) => normalizeOrder({ ...item.data(), firestoreId: item.id }, index));
      rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(rows);
      setLoadError("");
      setLoading(false);
    }, (error) => {
      console.error("Failed to load dealer orders:", error);
      setLoadError(error.code === "permission-denied" ? "Firebase permission denied while loading your orders." : "Could not load orders. Please refresh and try again.");
      setLoading(false);
    });
  }, []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === "PENDING").length,
      processing: orders.filter((order) => order.status === "IN_PRODUCTION").length,
      ready: orders.filter((order) => order.status === "READY").length,
      dispatched: orders.filter((order) => order.status === "DISPATCHED").length,
      delivered: orders.filter((order) => order.status === "DELIVERED").length,
    }),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.items.some(
          (item) =>
            item.product.toLowerCase().includes(query) ||
            item.shade.toLowerCase().includes(query),
        );

      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);


  const nextStatus = (status) => {
    const index = STATUS_FLOW.indexOf(status);
    return index >= 0 && index < STATUS_FLOW.length - 1
      ? STATUS_FLOW[index + 1]
      : null;
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#B5220E]">
              Pareek Dealer
            </p>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              My Orders
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track your orders, quantities and delivery status.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
            <RefreshCw size={17} /> Live Firebase Orders
          </span>
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            ["Total", stats.total, "text-slate-900"],
            ["Pending", stats.pending, "text-amber-600"],
            ["Processing", stats.processing, "text-blue-600"],
            ["Ready", stats.ready, "text-emerald-600"],
            ["Dispatched", stats.dispatched, "text-purple-600"],
            ["Delivered", stats.delivered, "text-green-600"],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order, product or shade..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#B5220E] focus:bg-white focus:ring-2 focus:ring-[#B5220E]/10"
              />
            </div>

            <div className="relative lg:w-56">
              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm outline-none focus:border-[#B5220E] focus:bg-white"
              >
                <option value="ALL">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">Order History</h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredOrders.length} order{filteredOrders.length === 1 ? "" : "s"} found
              </p>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Package size={26} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">No orders found</h3>
              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 transition hover:bg-slate-50/70"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-base font-bold text-slate-900">
                          {order.id}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {order.createdAt}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Package size={14} />
                          {order.items.length} line{order.items.length === 1 ? "" : "s"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Truck size={14} />
                          {order.deliveryType === "TRANSPORT" ? order.transport || "Transport" : "Direct Delivery"}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <span
                            key={`${order.id}-${index}`}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                          >
                            {item.product} · {item.shade} · {item.packSize} × {item.quantity}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="rounded-lg bg-[#B5220E]/5 px-3 py-1.5 text-xs font-semibold text-[#B5220E]">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 border-t border-slate-100 pt-4 xl:min-w-[240px] xl:border-t-0 xl:pt-0">
                      <div>
                        <p className="text-xs text-slate-500">Total Quantity</p>
                        <p className="mt-1 text-xl font-bold text-slate-900">
                          {totalQuantity(order)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#B5220E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#941B0B]"
                      >
                        <Eye size={16} />
                        View Details
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedOrder(null);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#B5220E]">
                  Order Details
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {selectedOrder.id}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedOrder.createdAt}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </p>
                  <div className="mt-3">
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Total Quantity
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {totalQuantity(selectedOrder)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Delivery
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {selectedOrder.deliveryType === "TRANSPORT"
                      ? selectedOrder.transport || "Transport"
                      : "Direct Delivery"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200">
                <div className="border-b border-slate-100 px-4 py-3">
                  <h3 className="font-bold text-slate-900">Products</h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={`${selectedOrder.id}-item-${index}`}
                      className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{item.product}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Shade: {item.shade}
                        </p>
                      </div>
                      <div className="text-sm text-slate-600">
                        Pack: <span className="font-semibold">{item.packSize}</span>
                      </div>
                      <div className="text-sm text-slate-600">
                        Qty: <span className="font-semibold">{item.quantity}</span>
                      </div>
                      <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-800">
                        {item.packSize} × {item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Delivery Details
                  </p>
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Truck size={16} />
                      {selectedOrder.deliveryType === "TRANSPORT"
                        ? selectedOrder.transport || "Transport selected"
                        : "Direct Delivery"}
                    </div>
                    {selectedOrder.remark && (
                      <p className="rounded-xl bg-slate-50 p-3 text-slate-600">
                        {selectedOrder.remark}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#B5220E]/10 bg-[#B5220E]/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#B5220E]">
                  Order Progress
                </p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
                  {STATUS_FLOW.map((status, index) => {
                    const currentIndex = STATUS_FLOW.indexOf(selectedOrder.status);
                    const active = index <= currentIndex;
                    const config = STATUS_CONFIG[status];
                    const Icon = config.icon;

                    return (
                      <div key={status} className="text-center">
                        <div
                          className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${
                            active ? "bg-[#B5220E] text-white" : "bg-white text-slate-300"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <p className="mt-2 text-[10px] font-semibold text-slate-500 sm:text-xs">
                          {config.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {nextStatus(selectedOrder.status) && (
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Next status
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Status updates will be connected to the backend later.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
                    {STATUS_CONFIG[nextStatus(selectedOrder.status)].label}
                  </span>
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
