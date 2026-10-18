import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Plus,
  Package,
  Clock3,
  CheckCircle2,
  Truck,
  Eye,
  Search,
  X,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

const initialOrders = [
  {
    id: "ORD-2026-148",
    dealer: "Raipur Paint Centre",
    phone: "9876543210",
    address: "Shop 12, Ganj Road, Raipur",
    date: "28 Sep 2026",
    status: "PENDING",
    products: [
      {
        product: "Interior Premium",
        shade: "Ivory White",
        packSize: "1 L",
        quantity: 30,
      },
      {
        product: "Interior Premium",
        shade: "Ivory White",
        packSize: "4 L",
        quantity: 20,
      },
    ],
  },
  {
    id: "ORD-2026-147",
    dealer: "Sharma Hardware & Paints",
    phone: "9765432109",
    address: "Main Market, Bilaspur",
    date: "27 Sep 2026",
    status: "IN_PRODUCTION",
    products: [
      {
        product: "Exterior Weather Shield",
        shade: "Pearl Grey",
        packSize: "20 L",
        quantity: 20,
      },
    ],
  },
  {
    id: "ORD-2026-146",
    dealer: "New Look Interiors",
    phone: "9654321098",
    address: "Civil Lines, Nagpur",
    date: "26 Sep 2026",
    status: "DISPATCHED",
    products: [
      {
        product: "Interior Premium",
        shade: "Sky Blue",
        packSize: "4 L",
        quantity: 15,
      },
    ],
  },
];

const statusConfig = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700",
  },
  IN_PRODUCTION: {
    label: "In Production",
    className: "bg-blue-50 text-blue-700",
  },
  READY: {
    label: "Ready",
    className: "bg-emerald-50 text-emerald-700",
  },
  DISPATCHED: {
    label: "Dispatched",
    className: "bg-purple-50 text-purple-700",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-slate-100 text-slate-600",
  },
};

const SalespersonDashboard = () => {
  const navigate = useNavigate();

  const [orders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const dispatchedOrders = orders.filter(
    (order) =>
      order.status === "DISPATCHED" ||
      order.status === "DELIVERED"
  ).length;

  const totalQuantity = orders.reduce(
    (total, order) =>
      total +
      order.products.reduce(
        (sum, product) => sum + product.quantity,
        0
      ),
    0
  );

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return orders;

    return orders.filter((order) => {
      return (
        order.id.toLowerCase().includes(query) ||
        order.dealer.toLowerCase().includes(query) ||
        order.products.some(
          (product) =>
            product.product.toLowerCase().includes(query) ||
            product.shade.toLowerCase().includes(query)
        )
      );
    });
  }, [orders, search]);

  // New Order navigation
  const handleNewOrder = () => {
    navigate("/salesperson/orders/new");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Salesperson Dashboard
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Welcome back, Rahul 👋
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage dealer orders and track their progress.
          </p>
        </div>

        {/* New Order Button */}
        <button
          onClick={handleNewOrder}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B5220E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#941D0C]"
        >
          <Plus size={18} />
          New Order
        </button>
      </div>

      {/* New Order Banner */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#1C1008] to-[#B5220E] p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Place a New Paint Order
            </h2>

            <p className="mt-1 text-sm text-white/65">
              Add products, shades, pack sizes and quantities
              in a single order.
            </p>
          </div>

          {/* Create Order Button */}
          <button
            onClick={handleNewOrder}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#B5220E] transition hover:bg-slate-100"
          >
            <Plus size={17} />
            Create Order
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardStat
          label="My Orders"
          value={totalOrders}
          icon={<Package size={20} />}
          iconClass="bg-red-50 text-red-600"
        />

        <DashboardStat
          label="Pending"
          value={pendingOrders}
          icon={<Clock3 size={20} />}
          iconClass="bg-amber-50 text-amber-600"
        />

        <DashboardStat
          label="Dispatched"
          value={dispatchedOrders}
          icon={<Truck size={20} />}
          iconClass="bg-purple-50 text-purple-600"
        />

        <DashboardStat
          label="Total Quantity"
          value={totalQuantity}
          icon={<CheckCircle2 size={20} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Orders */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Section Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              My Orders
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Orders placed by you for your dealers.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order or dealer..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#B5220E] focus:bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="bg-slate-50">
              <tr>
                <TableHead>Order ID</TableHead>
                <TableHead>Dealer</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead align="right">
                  Action
                </TableHead>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const quantity = order.products.reduce(
                  (sum, product) =>
                    sum + product.quantity,
                  0
                );

                const status = statusConfig[order.status];

                return (
                  <tr
                    key={order.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <span className="font-semibold text-[#B5220E]">
                        {order.id}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {order.dealer}
                      </div>

                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <Phone size={12} />
                        {order.phone}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex max-w-[230px] flex-wrap gap-1.5">
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                          {order.products[0].product}
                        </span>

                        {order.products.length > 1 && (
                          <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-[#B5220E]">
                            +{order.products.length - 1} more
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900">
                        {quantity}
                      </span>

                      <span className="ml-1 text-xs text-slate-400">
                        units
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {order.date}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() =>
                          setSelectedOrder(order)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="py-16 text-center">
              <Package
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-3 font-semibold text-slate-800">
                No orders found
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Try another search.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */

const DashboardStat = ({
  label,
  value,
  icon,
  iconClass,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </h3>
        </div>

        <div
          className={`rounded-xl p-2.5 ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const TableHead = ({ children, align }) => {
  return (
    <th
      className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {children}
    </th>
  );
};

const OrderDetailsModal = ({
  order,
  onClose,
}) => {
  const totalQuantity = order.products.reduce(
    (sum, product) =>
      sum + product.quantity,
    0
  );

  const status = statusConfig[order.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#B5220E]">
              Order Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {order.id}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dealer */}
        <div className="grid gap-4 border-b border-slate-200 p-6 sm:grid-cols-2">
          <Info
            label="Dealer"
            value={order.dealer}
            icon={<UserRound size={16} />}
          />

          <Info
            label="Phone"
            value={order.phone}
            icon={<Phone size={16} />}
          />

          <Info
            label="Delivery Address"
            value={order.address}
            icon={<MapPin size={16} />}
          />

          <Info
            label="Order Date"
            value={order.date}
            icon={<Package size={16} />}
          />
        </div>

        {/* Status */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <span className="text-sm font-semibold text-slate-700">
            Current Status
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        {/* Products */}
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">
              Products
            </h3>

            <span className="text-sm font-semibold text-[#B5220E]">
              {totalQuantity} Units
            </span>
          </div>

          <div className="space-y-3">
            {order.products.map((product, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="font-semibold text-slate-900">
                  {product.product}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-md bg-white px-2.5 py-1 text-xs text-slate-600">
                    Shade: {product.shade}
                  </span>

                  <span className="rounded-md bg-white px-2.5 py-1 text-xs text-slate-600">
                    Pack: {product.packSize}
                  </span>

                  <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-[#B5220E]">
                    Qty: {product.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value, icon }) => {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="flex items-start gap-2 text-sm font-medium text-slate-700">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
};

export default SalespersonDashboard;