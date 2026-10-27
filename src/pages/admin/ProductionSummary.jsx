import { useEffect, useMemo, useState } from "react";
import { watchCollection } from "../../services/firebaseData";

import {
  ChevronDown,
  Eye,
  Factory,
  Layers3,
  Package,
  Search,
  Users,
  X,
} from "lucide-react";

const normalizeOrderForProduction = (order) => {
  const items = [];
  const rawProducts = Array.isArray(order.products) ? order.products : [];
  const rawItems = Array.isArray(order.items) ? order.items : [];

  rawProducts.forEach((product) => {
    if (Array.isArray(product.shades)) {
      product.shades.forEach((shade) => {
        (shade.packs || []).forEach((pack) => items.push({
          product: product.productName || product.product || product.name || "Unknown Product",
          shade: shade.shade || shade.name || "Unspecified",
          packSize: pack.packSize || "—",
          quantity: Number(pack.quantity || 0),
        }));
      });
    } else {
      items.push({
        product: product.productName || product.product || product.name || "Unknown Product",
        shade: product.shade || "Unspecified",
        packSize: product.packSize || "—",
        quantity: Number(product.quantity || 0),
      });
    }
  });

  if (!items.length) {
    rawItems.forEach((item) => items.push({
      product: item.productName || item.product || item.name || "Unknown Product",
      shade: item.shade || "Unspecified",
      packSize: item.packSize || "—",
      quantity: Number(item.quantity || 0),
    }));
  }

  const dealerValue = order.dealerName || (typeof order.dealer === "object" ? order.dealer?.name : order.dealer);
  const timestampDate = order.createdAt?.toDate ? order.createdAt.toDate() : null;
  return {
    ...order,
    id: order.orderId || order.id,
    dealer: dealerValue || "Unknown Dealer",
    salesperson: order.salespersonName || order.salesperson || order.createdBy || "—",
    status: String(order.status || "PENDING").toUpperCase().replaceAll(" ", "_"),
    createdAt: timestampDate ? timestampDate.toISOString().slice(0, 10) : (typeof order.createdAt === "string" ? order.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
    items,
  };
};

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

    className: "bg-slate-100 text-slate-700",
  },
};

const ProductionSummary = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [productFilter, setProductFilter] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState(null);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => watchCollection("orders", (items) => {
    setOrders(items.map(normalizeOrderForProduction));
    setLoadingOrders(false);
    setOrdersError("");
  }, (error) => {
    console.error("Failed to load production orders from Firestore", error);
    setOrdersError("Production data could not be loaded. Check Firestore rules and your admin login.");
    setLoadingOrders(false);
  }), []);

  const productionData = useMemo(() => {
    const map = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = [item.product, item.shade, item.packSize].join("___");

        if (!map[key]) {
          map[key] = {
            id: key,

            product: item.product,

            shade: item.shade,

            packSize: item.packSize,

            totalQuantity: 0,

            orderCount: 0,

            dealers: [],

            orders: [],

            statuses: [],
          };
        }

        map[key].totalQuantity += item.quantity;

        if (!map[key].orders.includes(order.id)) {
          map[key].orders.push(order.id);

          map[key].orderCount += 1;
        }

        if (!map[key].dealers.includes(order.dealer)) {
          map[key].dealers.push(order.dealer);
        }

        if (!map[key].statuses.includes(order.status)) {
          map[key].statuses.push(order.status);
        }
      });
    });

    return Object.values(map);
  }, [orders]);

  const products = useMemo(() => {
    return [...new Set(productionData.map((item) => item.product))];
  }, [productionData]);

  const filteredData = useMemo(() => {
    return productionData.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        item.product.toLowerCase().includes(searchText) ||
        item.shade.toLowerCase().includes(searchText) ||
        item.packSize.toLowerCase().includes(searchText) ||
        item.dealers.some((dealer) =>
          dealer.toLowerCase().includes(searchText),
        );

      const matchesProduct =
        productFilter === "ALL" || item.product === productFilter;

      const matchesStatus =
        statusFilter === "ALL" || item.statuses.includes(statusFilter);

      return matchesSearch && matchesProduct && matchesStatus;
    });
  }, [productionData, search, productFilter, statusFilter]);

  const totalProductionQty = productionData.reduce(
    (sum, item) => sum + item.totalQuantity,

    0,
  );

  const totalProductionLines = productionData.length;

  const totalDealers = new Set(productionData.flatMap((item) => item.dealers))
    .size;

  const inProductionQty = productionData

    .filter((item) => item.statuses.includes("IN_PRODUCTION"))

    .reduce((sum, item) => sum + item.totalQuantity, 0);

  const getProductionStatus = (statuses) => {
    if (statuses.includes("IN_PRODUCTION")) {
      return "IN_PRODUCTION";
    }

    if (statuses.includes("PENDING")) {
      return "PENDING";
    }

    if (statuses.includes("READY")) {
      return "READY";
    }

    if (statuses.includes("DISPATCHED")) {
      return "DISPATCHED";
    }

    return "DELIVERED";
  };

  return (
    <div className="space-y-6">
            {/***** Header *****/}     {" "}
      <div>
               {" "}
        <h1 className="text-2xl font-bold text-slate-900">
                    Production Summary        {" "}
        </h1>
               {" "}
        <p className="mt-1 text-sm text-slate-500">
                    Consolidated production requirement by product, shade and
          pack size.        {" "}
        </p>
             {" "}
      </div>
            {/***** Info Banner *****/}     {" "}
      {loadingOrders && <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">Loading production data from Firebase…</div>}
      {ordersError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{ordersError}</div>}
      {!loadingOrders && !ordersError && orders.length === 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">No Firebase orders found yet. Production summary will populate when orders are placed.</div>}

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
               {" "}
        <div className="flex items-start gap-3">
                    <Factory className="mt-0.5 h-5 w-5 text-blue-600" />       
           {" "}
          <div>
                       {" "}
            <p className="text-sm font-semibold text-blue-900">
                            Production aggregation            {" "}
            </p>
                       {" "}
            <p className="mt-1 text-sm text-blue-700">
                            Dealer-wise orders remain separate. This screen only
              consolidates               quantities for production planning.    
                     {" "}
            </p>
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </div>
            {/***** Stats *****/}     {" "}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
               {" "}
        <StatCard
          title="Total Production Qty"
          value={totalProductionQty}
          suffix="Units"
          icon={Package}
        />
               {" "}
        <StatCard
          title="Production Lines"
          value={totalProductionLines}
          suffix="Lines"
          icon={Layers3}
        />
               {" "}
        <StatCard
          title="Dealers"
          value={totalDealers}
          suffix="Dealers"
          icon={Users}
        />
               {" "}
        <StatCard
          title="In Production"
          value={inProductionQty}
          suffix="Units"
          icon={Factory}
        />
             {" "}
      </div>
            {/***** Filters *****/}     {" "}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
               {" "}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    {/***** Search *****/}         {" "}
          <div className="relative md:col-span-2">
                       {" "}
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                       {" "}
            <input
              type="text"
              placeholder="Search product, shade, pack size or dealer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
                     {" "}
          </div>
                    {/***** Product *****/}         {" "}
          <div className="relative">
                       {" "}
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm outline-none focus:border-blue-500"
            >
                            <option value="ALL">All Products</option>           
               {" "}
              {products.map((product) => (
                <option key={product} value={product}>
                                    {product}               {" "}
                </option>
              ))}
                         {" "}
            </select>
                       {" "}
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                     {" "}
          </div>
                    {/***** Status *****/}         {" "}
          <div className="relative">
                       {" "}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm outline-none focus:border-blue-500"
            >
                            <option value="ALL">All Statuses</option>           
                <option value="PENDING">Pending</option>             {" "}
              <option value="IN_PRODUCTION">
                                In Production              {" "}
              </option>
                            <option value="READY">Ready</option>             {" "}
              <option value="DISPATCHED">Dispatched</option>             {" "}
              <option value="DELIVERED">Delivered</option>           {" "}
            </select>
                       {" "}
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </div>
            {/***** Production Table *****/}     {" "}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
               {" "}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                   {" "}
          <div>
                       {" "}
            <h2 className="font-semibold text-slate-900">
                            Consolidated Production            {" "}
            </h2>
                       {" "}
            <p className="mt-1 text-xs text-slate-500">
                            {filteredData.length} production line              {" "}
              {filteredData.length !== 1 ? "s" : ""} found            {" "}
            </p>
                     {" "}
          </div>
                   {" "}
          <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                       {" "}
            {filteredData.reduce(
              (sum, item) => sum + item.totalQuantity,

              0,
            )}{" "}
                        Units          {" "}
          </div>
                 {" "}
        </div>
               {" "}
        <div className="overflow-x-auto">
                   {" "}
          <table className="w-full min-w-[900px] text-left">
                       {" "}
            <thead className="bg-slate-50">
                           {" "}
              <tr className="border-b border-slate-200">
                               {" "}
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Product                {" "}
                </th>
                               {" "}
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Shade                {" "}
                </th>
                               {" "}
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Pack Size                {" "}
                </th>
                               {" "}
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Total Qty                {" "}
                </th>
                               {" "}
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Orders                {" "}
                </th>
                               {" "}
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Dealers                {" "}
                </th>
                               {" "}
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status                {" "}
                </th>
                               {" "}
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Action                {" "}
                </th>
                             {" "}
              </tr>
                         {" "}
            </thead>
                       {" "}
            <tbody>
                           {" "}
              {filteredData.map((item) => {
                const productionStatus = getProductionStatus(item.statuses);

                const status =
                  statusConfig[productionStatus] || statusConfig.PENDING;

                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                                        {/***** Product *****/}                 
                     {" "}
                    <td className="px-5 py-4">
                                           {" "}
                      <div className="font-medium text-slate-900">
                                                {item.product}                 
                           {" "}
                      </div>
                                           {" "}
                      <div className="mt-1 text-xs text-slate-500">
                                                Production SKU                  
                           {" "}
                      </div>
                                         {" "}
                    </td>
                                        {/***** Shade *****/}                   {" "}
                    <td className="px-5 py-4">
                                           {" "}
                      <div className="flex items-center gap-2">
                                               {" "}
                        <div className="h-5 w-5 rounded-full border border-slate-300 bg-slate-100" />
                                               {" "}
                        <span className="text-sm font-medium text-slate-700">
                                                    {item.shade}               
                                 {" "}
                        </span>
                                             {" "}
                      </div>
                                         {" "}
                    </td>
                                        {/***** Pack *****/}                   {" "}
                    <td className="px-5 py-4">
                                           {" "}
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700">
                                                {item.packSize}                 
                           {" "}
                      </span>
                                         {" "}
                    </td>
                                        {/***** Quantity *****/}               
                       {" "}
                    <td className="px-5 py-4 text-center">
                                           {" "}
                      <span className="text-lg font-bold text-slate-900">
                                                {item.totalQuantity}           
                                 {" "}
                      </span>
                                         {" "}
                    </td>
                                        {/***** Orders *****/}                 
                     {" "}
                    <td className="px-5 py-4 text-center">
                                           {" "}
                      <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                                                {item.orderCount}               
                             {" "}
                      </span>
                                         {" "}
                    </td>
                                        {/***** Dealers *****/}                 
                     {" "}
                    <td className="px-5 py-4">
                                           {" "}
                      <div className="max-w-[220px]">
                                               {" "}
                        <p className="text-sm text-slate-700">
                                                    {item.dealers[0]}           
                                     {" "}
                        </p>
                                               {" "}
                        {item.dealers.length > 1 && (
                          <p className="mt-1 text-xs font-medium text-blue-600">
                                                        +
                            {item.dealers.length - 1} more dealer              
                                         {" "}
                            {item.dealers.length - 1 !== 1 ? "s" : ""}         
                                           {" "}
                          </p>
                        )}
                                             {" "}
                      </div>
                                         {" "}
                    </td>
                                        {/***** Status *****/}                 
                     {" "}
                    <td className="px-5 py-4">
                                           {" "}
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                      >
                                                {status.label}                 
                           {" "}
                      </span>
                                         {" "}
                    </td>
                                        {/* Action */}                   {" "}
                    <td className="px-5 py-4 text-right">
                                           {" "}
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                                                <Eye className="h-4 w-4" />     
                                          Details                      {" "}
                      </button>
                                         {" "}
                    </td>
                                     {" "}
                  </tr>
                );
              })}
                         {" "}
            </tbody>
                     {" "}
          </table>
                 {" "}
        </div>
               {" "}
        {filteredData.length === 0 && (
          <div className="px-5 py-16 text-center">
                        <Factory className="mx-auto h-10 w-10 text-slate-300" />
                       {" "}
            <h3 className="mt-3 font-semibold text-slate-900">
                            No production data found            {" "}
            </h3>
                       {" "}
            <p className="mt-1 text-sm text-slate-500">
                            Try changing your search or filters.          
               {" "}
            </p>
                     {" "}
          </div>
        )}
             {" "}
      </div>
            {/* Details Modal */}     {" "}
      {selectedItem && (
        <ProductionDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
         {" "}
    </div>
  );
};

const StatCard = ({
  title,

  value,

  suffix,

  icon: Icon,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
           {" "}
      <div className="flex items-start justify-between">
               {" "}
        <div>
                   {" "}
          <p className="text-sm font-medium text-slate-500">
                        {title}         {" "}
          </p>
                   {" "}
          <div className="mt-2 flex items-baseline gap-2">
                       {" "}
            <h3 className="text-2xl font-bold text-slate-900">
                            {value}           {" "}
            </h3>
                       {" "}
            <span className="text-xs text-slate-400">
                            {suffix}           {" "}
            </span>
                     {" "}
          </div>
                 {" "}
        </div>
               {" "}
        <div className="rounded-lg bg-blue-50 p-2.5">
                    <Icon className="h-5 w-5 text-blue-600" />       {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
};

const ProductionDetailsModal = ({
  item,

  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-3 sm:p-4"
      onClick={onClose}
    >
           {" "}
      <div
        className="relative mx-auto my-0 sm:my-4 w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
                {/* Header */}       {" "}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
                   {" "}
          <div>
                       {" "}
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Production Details            {" "}
            </p>
                       {" "}
            <h2 className="mt-1 text-xl font-bold text-slate-900">
                            {item.product}           {" "}
            </h2>
                     {" "}
          </div>
                   {" "}
          <button
            onClick={onClose}
            aria-label="Close production details"
            title="Close"
            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
                        <X className="h-5 w-5" />         {" "}
          </button>
                 {" "}
        </div>
                {/* Product Summary */}       {" "}
        <div className="grid grid-cols-1 gap-3 border-b border-slate-200 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6 lg:grid-cols-3">
                    <InfoBox label="Shade" value={item.shade} />
                    <InfoBox label="Pack Size" value={item.packSize} />         {" "}
          <InfoBox
            label="Total Quantity"
            value={`${item.totalQuantity} Units`}
          />
                 {" "}
        </div>
                {/* Dealers */}       {" "}
        <div className="p-4 sm:p-6">
                   {" "}
          <h3 className="mb-4 font-semibold text-slate-900">
                        Contributing Orders          {" "}
          </h3>
                   {" "}
          <div className="space-y-3">
                       {" "}
            {item.orders.map((orderId, index) => (
              <div
                key={orderId}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
              >
                               {" "}
                <div>
                                   {" "}
                  <p className="text-sm font-semibold text-slate-900">
                                        {orderId}                 {" "}
                  </p>
                                   {" "}
                  <p className="mt-1 text-xs text-slate-500">
                                        {item.dealers[index] || item.dealers[0]}
                                     {" "}
                  </p>
                                 {" "}
                </div>
                               {" "}
                <span className="rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                    Order Included                {" "}
                </span>
                             {" "}
              </div>
            ))}
                     {" "}
          </div>
                 {" "}
        </div>
                {/* Footer */}       {" "}
        <div className="sticky bottom-0 flex justify-end border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6 sm:py-4">
                   {" "}
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
                        Close          {" "}
          </button>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
};

const InfoBox = ({ label, value }) => {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">        {label}      </p>     {" "}
      <p className="mt-1 font-semibold text-slate-900">        {value}      </p>
         {" "}
    </div>
  );
};

export default ProductionSummary;
