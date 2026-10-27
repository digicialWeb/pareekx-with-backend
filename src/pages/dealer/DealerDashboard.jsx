import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Package,
  Clock3,
  Factory,
  CheckCircle2,
  Truck,
  Eye,
  X,
  FileText,
} from "lucide-react";

const INITIAL_ORDERS = [
  {
    id: "PRK-202601",
    date: "02 Oct 2026",
    status: "PENDING",
    deliveryType: "Direct Delivery",
    transport: null,
    remark: "Please dispatch as soon as possible.",
    totalQty: 65,
    products: [
      {
        name: "Interior Emulsion — Premium",
        shade: "Ivory White",
        packSize: "20L",
        quantity: 30,
      },
      {
        name: "Interior Emulsion — Premium",
        shade: "Pastel Blue",
        packSize: "10L",
        quantity: 20,
      },
      {
        name: "Exterior Primer",
        shade: "White Base",
        packSize: "20L",
        quantity: 15,
      },
    ],
  },
  {
    id: "PRK-202598",
    date: "30 Sep 2026",
    status: "IN_PRODUCTION",
    deliveryType: "Transport Delivery",
    transport: "Shree Balaji Transport",
    remark: "Urgent order.",
    totalQty: 48,
    products: [
      {
        name: "Exterior Weather Shield",
        shade: "Off White",
        packSize: "20L",
        quantity: 20,
      },
      {
        name: "Texture Paint — Smooth",
        shade: "Sand Beige",
        packSize: "25kg",
        quantity: 18,
      },
      {
        name: "Waterproof Coating",
        shade: "N/A",
        packSize: "20L",
        quantity: 10,
      },
    ],
  },
  {
    id: "PRK-202591",
    date: "27 Sep 2026",
    status: "READY",
    deliveryType: "Direct Delivery",
    transport: null,
    remark: "",
    totalQty: 35,
    products: [
      {
        name: "Interior Emulsion — Standard",
        shade: "Light Grey",
        packSize: "20L",
        quantity: 20,
      },
      {
        name: "Exterior Primer",
        shade: "Grey Base",
        packSize: "10L",
        quantity: 15,
      },
    ],
  },
  {
    id: "PRK-202574",
    date: "22 Sep 2026",
    status: "DISPATCHED",
    deliveryType: "Transport Delivery",
    transport: "Mahadev Logistics",
    remark: "Deliver to main shop.",
    totalQty: 55,
    products: [
      {
        name: "Enamel Paint — White",
        shade: "Pure White",
        packSize: "4L",
        quantity: 40,
      },
      {
        name: "Wood Primer",
        shade: "White Base",
        packSize: "4L",
        quantity: 15,
      },
    ],
  },
];

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock3,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  IN_PRODUCTION: {
    label: "In Production",
    icon: Factory,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  READY: {
    label: "Ready",
    icon: CheckCircle2,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  DISPATCHED: {
    label: "Dispatched",
    icon: Truck,
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export default function DealerDashboard() {
  const navigate = useNavigate();

  const [orders] = useState(INITIAL_ORDERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(
        (order) => order.status === "PENDING"
      ).length,
      production: orders.filter(
        (order) => order.status === "IN_PRODUCTION"
      ).length,
      ready: orders.filter(
        (order) => order.status === "READY"
      ).length,
      dispatched: orders.filter(
        (order) => order.status === "DISPATCHED"
      ).length,
      quantity: orders.reduce(
        (sum, order) => sum + order.totalQty,
        0
      ),
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.products.some((product) =>
          product.name.toLowerCase().includes(query)
        ) ||
        order.products.some((product) =>
          product.shade.toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B5220E] text-lg font-bold text-white">
              P
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Pareek
              </h1>

              <p className="text-xs text-slate-500">
                Dealer Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                Raipur Paint Centre
              </p>

              <p className="text-xs text-slate-500">
                Dealer
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B5220E]/10 font-bold text-[#B5220E]">
              RP
            </div>

            <button
              onClick={() => navigate("/login")}
              className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:block"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-7">
        {/* Welcome + New Order */}
        <section className="mb-6 overflow-hidden rounded-2xl bg-[#B5220E] p-6 text-white shadow-lg">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-white/70">
                Welcome back
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Raipur Paint Centre
              </h2>

              <p className="mt-2 max-w-xl text-sm text-white/75">
                Place a new order and track your existing orders
                from one place.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/dealer/orders/new")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-[#B5220E] transition hover:bg-slate-100"
            >
              <Plus size={19} />
              New Order
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-7 grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatCard
            icon={<Package size={20} />}
            label="Total Orders"
            value={stats.total}
            iconClass="bg-[#B5220E]/10 text-[#B5220E]"
          />

          <StatCard
            icon={<Clock3 size={20} />}
            label="Pending"
            value={stats.pending}
            iconClass="bg-amber-100 text-amber-600"
          />

          <StatCard
            icon={<Factory size={20} />}
            label="Production"
            value={stats.production}
            iconClass="bg-blue-100 text-blue-600"
          />

          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Ready"
            value={stats.ready}
            iconClass="bg-green-100 text-green-600"
          />

          <StatCard
            icon={<Truck size={20} />}
            label="Dispatched"
            value={stats.dispatched}
            iconClass="bg-purple-100 text-purple-600"
          />

          <StatCard
            icon={<Package size={20} />}
            label="Total Qty"
            value={stats.quantity}
            iconClass="bg-slate-100 text-slate-600"
          />
        </section>

        {/* Orders */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Section Header */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                My Orders
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track all orders placed from your account.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search orders..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#B5220E] sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#B5220E]"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PRODUCTION">
                  In Production
                </option>
                <option value="READY">Ready</option>
                <option value="DISPATCHED">
                  Dispatched
                </option>
                <option value="DELIVERED">
                  Delivered
                </option>
              </select>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Order ID
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Products
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Quantity
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Date
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-14 text-center"
                    >
                      <Package
                        size={35}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 font-semibold text-slate-600">
                        No orders found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Try changing your search or filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onView={() =>
                        setSelectedOrder(order)
                      }
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 p-4 md:hidden">
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center">
                <Package
                  size={35}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-semibold text-slate-600">
                  No orders found
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <MobileOrderCard
                  key={order.id}
                  order={order}
                  onView={() =>
                    setSelectedOrder(order)
                  }
                />
              ))
            )}
          </div>
        </section>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

/* =========================================================
   Stat Card
========================================================= */

function StatCard({
  icon,
  label,
  value,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   Order Row
========================================================= */

function OrderRow({ order, onView }) {
  const config =
    STATUS_CONFIG[order.status] ||
    STATUS_CONFIG.PENDING;

  const StatusIcon = config.icon;

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
      <td className="px-5 py-4">
        <p className="font-bold text-[#B5220E]">
          {order.id}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="font-medium text-slate-800">
          {order.products.length} product
          {order.products.length !== 1 ? "s" : ""}
        </p>

        <p className="mt-1 max-w-[280px] truncate text-xs text-slate-400">
          {order.products
            .map((product) => product.name)
            .join(", ")}
        </p>
      </td>

      <td className="px-5 py-4">
        <span className="font-semibold text-slate-800">
          {order.totalQty}
        </span>

        <span className="ml-1 text-xs text-slate-400">
          units
        </span>
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {order.date}
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          config={config}
          StatusIcon={StatusIcon}
        />
      </td>

      <td className="px-5 py-4 text-right">
        <button
          onClick={onView}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#B5220E] hover:text-[#B5220E]"
        >
          <Eye size={14} />
          View
        </button>
      </td>
    </tr>
  );
}

/* =========================================================
   Mobile Order Card
========================================================= */

function MobileOrderCard({ order, onView }) {
  const config =
    STATUS_CONFIG[order.status] ||
    STATUS_CONFIG.PENDING;

  const StatusIcon = config.icon;

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-[#B5220E]">
            {order.id}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {order.date}
          </p>
        </div>

        <StatusBadge
          config={config}
          StatusIcon={StatusIcon}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-400">
            Products
          </p>

          <p className="mt-1 font-semibold text-slate-800">
            {order.products.length}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-400">
            Quantity
          </p>

          <p className="mt-1 font-semibold text-slate-800">
            {order.totalQty}
          </p>
        </div>
      </div>

      <button
        onClick={onView}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600"
      >
        <Eye size={15} />
        View Order
      </button>
    </div>
  );
}

/* =========================================================
   Status Badge
========================================================= */

function StatusBadge({ config, StatusIcon }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      <StatusIcon size={13} />
      {config.label}
    </span>
  );
}

/* =========================================================
   Order Details Modal
========================================================= */

function OrderDetailsModal({ order, onClose }) {
  const config =
    STATUS_CONFIG[order.status] ||
    STATUS_CONFIG.PENDING;

  const StatusIcon = config.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Order Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#B5220E]">
              {order.id}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[70vh] overflow-y-auto p-5">
          {/* Status */}
          <div className="mb-5 flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div>
              <p className="text-xs text-slate-400">
                Current Status
              </p>

              <div className="mt-2">
                <StatusBadge
                  config={config}
                  StatusIcon={StatusIcon}
                />
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">
                Order Date
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {order.date}
              </p>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="mb-3 font-bold text-slate-900">
              Products
            </h3>

            <div className="space-y-3">
              {order.products.map(
                (product, index) => (
                  <div
                    key={`${product.name}-${index}`}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {product.name}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-md bg-[#B5220E]/10 px-2 py-1 text-xs font-medium text-[#B5220E]">
                            Shade: {product.shade}
                          </span>

                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                            Pack: {product.packSize}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-400">
                          Quantity
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {product.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Delivery */}
          <div className="mt-6">
            <h3 className="mb-3 font-bold text-slate-900">
              Delivery
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Truck size={16} />
                  <span className="text-xs">
                    Delivery Type
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {order.deliveryType}
                </p>
              </div>

              {order.transport && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Truck size={16} />
                    <span className="text-xs">
                      Transport
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {order.transport}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Remark */}
          {order.remark && (
            <div className="mt-6">
              <h3 className="mb-3 font-bold text-slate-900">
                Remark
              </h3>

              <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                <FileText
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <p>{order.remark}</p>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="mt-6 flex items-center justify-between rounded-xl bg-[#B5220E] p-4 text-white">
            <div>
              <p className="text-xs text-white/70">
                Total Order Quantity
              </p>

              <p className="mt-1 text-2xl font-bold">
                {order.totalQty}
              </p>
            </div>

            <Package size={30} />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}