import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart, Clock3, Factory, CheckCircle2, Truck, Users, UserRound,
  ArrowUpRight, MoreHorizontal, RefreshCw,
} from "lucide-react";
import { watchCollection } from "../../services/firebaseData";

const STATUS_LABELS = {
  PENDING: "Pending",
  IN_PRODUCTION: "In Production",
  INPRODUCTION: "In Production",
  PRODUCTION: "In Production",
  READY: "Ready",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  COMPLETED: "Delivered",
  CANCELLED: "Cancelled",
};

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  "In Production": "bg-blue-50 text-blue-700",
  Ready: "bg-emerald-50 text-emerald-700",
  Dispatched: "bg-purple-50 text-purple-700",
  Delivered: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
};

const normalizeStatus = (value) => {
  const key = String(value || "PENDING").trim().toUpperCase().replace(/[ -]+/g, "_");
  return STATUS_LABELS[key] || key.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
};

const getOrderDate = (order) => {
  const value = order.createdAt || order.orderDate || order.date || order.createdOn;
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (date) =>
  date ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date) : "—";

const getDealerName = (order) =>
  (typeof order.dealer === "object" ? order.dealer?.name : order.dealer) ||
  order.dealerName || order.dealerBusinessName || "—";

const getSalespersonName = (order) =>
  order.salespersonName ||
  order.createdBy ||
  (typeof order.salesperson === "object" ? order.salesperson?.name : order.salesperson) ||
  "—";

const getOrderQuantity = (order) => {
  if (Array.isArray(order.items)) {
    return order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }
  if (Array.isArray(order.products)) {
    return order.products.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }
  return Number(order.totalQuantity ?? order.quantity ?? 0);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataErrors, setDataErrors] = useState([]);

  useEffect(() => {
    let pending = 4;
    const markLoaded = () => {
      pending -= 1;
      if (pending <= 0) setLoading(false);
    };
    const listen = (collectionName, setter) => watchCollection(
      collectionName,
      (items) => {
        setter(items);
        setDataErrors((current) => current.filter((item) => item !== collectionName));
        markLoaded();
      },
      (error) => {
        console.error(`Failed to load ${collectionName} from Firestore`, error);
        setDataErrors((current) => current.includes(collectionName) ? current : [...current, collectionName]);
        markLoaded();
      },
    );

    const unsubscribers = [
      listen("orders", setOrders),
      listen("dealers", setDealers),
      listen("salespersons", setSalespersons),
      listen("products", setProducts),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe?.());
  }, []);

  const stats = useMemo(() => {
    const normalized = orders.map((order) => normalizeStatus(order.status));
    const activeDealers = dealers.filter((dealer) => dealer.active !== false);
    const activeSalespersons = salespersons.filter((person) => person.active !== false);
    return [
      { title: "Total Orders", value: orders.length, change: "", icon: ShoppingCart, description: "all recorded orders", path: "/admin/orders" },
      { title: "Pending", value: normalized.filter((status) => status === "Pending").length, change: "", icon: Clock3, description: "needs attention", path: "/admin/orders?status=PENDING" },
      { title: "In Production", value: normalized.filter((status) => status === "In Production").length, change: "", icon: Factory, description: "currently active", path: "/admin/orders?status=IN_PRODUCTION" },
      { title: "Ready", value: normalized.filter((status) => status === "Ready").length, change: "", icon: CheckCircle2, description: "ready for dispatch", path: "/admin/orders?status=READY" },
      { title: "Dispatched", value: normalized.filter((status) => status === "Dispatched").length, change: "", icon: Truck, description: "dispatched orders", path: "/admin/orders?status=DISPATCHED" },
      { title: "Dealers", value: activeDealers.length, change: "", icon: Users, description: "active dealers", path: "/admin/dealers" },
      { title: "Salespersons", value: activeSalespersons.length, change: "", icon: UserRound, description: "active members", path: "/admin/salespersons" },
    ];
  }, [orders, dealers, salespersons]);

  const recentOrders = useMemo(() => [...orders]
    .sort((a, b) => (getOrderDate(b)?.getTime() || 0) - (getOrderDate(a)?.getTime() || 0))
    .slice(0, 4)
    .map((order) => ({
      id: order.orderNumber || order.orderId || order.id,
      dealer: getDealerName(order),
      salesperson: getSalespersonName(order),
      quantity: getOrderQuantity(order),
      status: normalizeStatus(order.status),
      date: formatDate(getOrderDate(order)),
    })), [orders]);

  const productionSummary = useMemo(() => {
    const totals = new Map();
    orders
      .filter((order) => ["Pending", "In Production", "Ready"].includes(normalizeStatus(order.status)))
      .forEach((order) => {
        const items = Array.isArray(order.items) ? order.items : Array.isArray(order.products) ? order.products : [];
        items.forEach((item) => {
          const product = item.productName || (typeof item.product === "object" ? item.product?.name : item.product) || item.name || "Product";
          const shade = item.shadeName || (typeof item.shade === "object" ? item.shade?.name : item.shade) || "—";
          const packSize = item.packSize || item.size || "—";
          const key = `${product}|||${shade}|||${packSize}`;
          const quantity = Number(item.quantity || 0);
          totals.set(key, (totals.get(key) || 0) + quantity);
        });
      });
    return [...totals.entries()]
      .map(([key, quantity]) => {
        const [product, shade, packSize] = key.split("|||");
        return { product, shade, packSize, quantity };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date())}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">Here's what's happening with your orders today.</p>
        </div>
        <button onClick={() => navigate("/admin/orders")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
          View All Orders <ArrowUpRight size={16} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <RefreshCw size={16} className="animate-spin" /> Loading dashboard data from Firebase…
        </div>
      )}
      {!loading && dataErrors.length > 0 && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Some data could not be loaded ({dataErrors.join(", ")}). Check Firestore rules and the admin profile.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button type="button" key={stat.title} onClick={() => navigate(stat.path)} aria-label={`View ${stat.title}`}
              className="group w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Icon size={18} /></div>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-700">{stat.title}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{stat.description}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div><h3 className="font-bold text-slate-900">Recent Orders</h3><p className="mt-0.5 text-xs text-slate-500">Latest orders received</p></div>
            <button onClick={() => navigate("/admin/orders")} className="text-sm font-semibold text-slate-700 hover:text-slate-900">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead><tr className="border-b border-slate-100 text-left">
                {["Order", "Dealer", "Salesperson", "Quantity", "Status", "Date", ""].map((label, index) => <th key={`${label}-${index}`} className="px-5 py-3 text-xs font-semibold text-slate-400">{label}</th>)}
              </tr></thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={order.id || index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-4"><p className="text-sm font-bold text-slate-800">{order.id || "—"}</p></td>
                    <td className="px-5 py-4"><p className="text-sm font-medium text-slate-700">{order.dealer}</p></td>
                    <td className="px-5 py-4 text-sm text-slate-600">{order.salesperson}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">{order.quantity} Units</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status] || "bg-slate-100 text-slate-700"}`}>{order.status}</span></td>
                    <td className="px-5 py-4 text-xs text-slate-500">{order.date}</td>
                    <td className="px-5 py-4"><button aria-label={`Open order ${order.id || ""}`} onClick={() => navigate("/admin/orders")} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal size={18} /></button></td>
                  </tr>
                ))}
                {!loading && recentOrders.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">No orders found in Firebase yet. Orders stored only in local demo data are not shown here.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div><h3 className="font-bold text-slate-900">Production Summary</h3><p className="mt-0.5 text-xs text-slate-500">Consolidated production requirement</p></div>
            <button onClick={() => navigate("/admin/orders")} className="text-sm font-semibold text-slate-700 hover:text-slate-900">View all</button>
          </div>
          <div className="divide-y divide-slate-100">
            {productionSummary.map((item, index) => (
              <div key={`${item.product}-${item.shade}-${item.packSize}-${index}`} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{item.product}</p><div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>{item.shade}</span><span>•</span><span>{item.packSize}</span></div></div>
                <div className="shrink-0 text-right"><p className="text-lg font-bold text-slate-900">{item.quantity}</p><p className="text-[11px] text-slate-400">units</p></div>
              </div>
            ))}
            {!loading && productionSummary.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-500">No active production items found in Firebase orders.</p>}
          </div>
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-3"><p className="text-xs text-slate-500">Quantities are consolidated from Firebase orders in Pending, In Production and Ready status.</p></div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
