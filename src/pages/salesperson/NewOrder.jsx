import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import { getDealersBySalesperson } from "../../data/pareekxStore";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  Package,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

const PRODUCTS = [
  {
    id: 1,

    name: "Premium Paint",

    code: "PP-001",

    shades: [
      { id: 101, name: "Royal Blue", code: "RB-101" },

      { id: 102, name: "Pearl White", code: "PW-102" },

      { id: 103, name: "Forest Green", code: "FG-103" },

      { id: 104, name: "Brick Red", code: "BR-104" },
    ],
  },

  {
    id: 2,

    name: "Interior Emulsion",

    code: "IE-002",

    shades: [
      { id: 201, name: "Pearl White", code: "PW-201" },

      { id: 202, name: "Ivory Cream", code: "IC-202" },

      { id: 203, name: "Sky Blue", code: "SB-203" },
    ],
  },

  {
    id: 3,

    name: "Exterior Coat",

    code: "EC-003",

    shades: [
      { id: 301, name: "Brick Red", code: "BR-301" },

      { id: 302, name: "Stone Grey", code: "SG-302" },

      { id: 303, name: "Sand Beige", code: "SB-303" },
    ],
  },
];

const PACK_SIZES = ["1 L", "4 L", "10 L", "20 L"];

const emptyLine = () => ({
  id: Date.now() + Math.random(),

  packSize: "",

  quantity: 1,
});

export default function NewOrder() {
  const navigate = useNavigate();

  // Temporary salesperson id until Spring Boot authentication is connected.
  const salespersonId = 1;

  const [dealers, setDealers] = useState([]);
  const [dealerId, setDealerId] = useState("");

  const [productId, setProductId] = useState("");

  const [shadeId, setShadeId] = useState("");

  const [shadeLines, setShadeLines] = useState([]);

  const [notes, setNotes] = useState("");

  useEffect(() => {
    const assignedDealers = getDealersBySalesperson(salespersonId);
    setDealers(assignedDealers);

    setDealerId((current) =>
      assignedDealers.some((dealer) => String(dealer.id) === String(current))
        ? current
        : "",
    );
  }, [salespersonId]);

  const selectedDealer = useMemo(
    () => dealers.find((dealer) => String(dealer.id) === String(dealerId)),
    [dealers, dealerId],
  );

  const selectedProduct = useMemo(
    () => PRODUCTS.find((product) => String(product.id) === String(productId)),

    [productId],
  );

  const selectedShade = useMemo(
    () =>
      selectedProduct?.shades.find(
        (shade) => String(shade.id) === String(shadeId),
      ),

    [selectedProduct, shadeId],
  );

  const totalQuantity = useMemo(
    () =>
      shadeLines.reduce(
        (total, shade) =>
          total +
          shade.lines.reduce(
            (lineTotal, line) => lineTotal + Number(line.quantity || 0),

            0,
          ),

        0,
      ),

    [shadeLines],
  );

  const resetProductSelection = () => {
    setProductId("");

    setShadeId("");
  };

  const addShade = () => {
    if (!selectedProduct || !selectedShade) {
      alert("Please select Product and Shade first.");

      return;
    }

    const alreadyAdded = shadeLines.some(
      (item) =>
        String(item.productId) === String(selectedProduct.id) &&
        String(item.shadeId) === String(selectedShade.id),
    );

    if (alreadyAdded) {
      alert("This shade is already added. Add another pack size below.");

      return;
    }

    setShadeLines((current) => [
      ...current,

      {
        id: Date.now() + Math.random(),

        productId: selectedProduct.id,

        productName: selectedProduct.name,

        shadeId: selectedShade.id,

        shadeName: selectedShade.name,

        shadeCode: selectedShade.code,

        lines: [emptyLine()],
      },
    ]);

    setShadeId("");
  };

  const removeShade = (shadeRowId) => {
    setShadeLines((current) =>
      current.filter((item) => item.id !== shadeRowId),
    );
  };

  const addPackSize = (shadeRowId) => {
    setShadeLines((current) =>
      current.map((shade) =>
        shade.id === shadeRowId
          ? { ...shade, lines: [...shade.lines, emptyLine()] }
          : shade,
      ),
    );
  };

  const removePackSize = (shadeRowId, lineId) => {
    setShadeLines((current) =>
      current

        .map((shade) => {
          if (shade.id !== shadeRowId) return shade;

          if (shade.lines.length === 1) return shade;

          return {
            ...shade,

            lines: shade.lines.filter((line) => line.id !== lineId),
          };
        })

        .filter((shade) => shade.lines.length > 0),
    );
  };

  const updatePackLine = (shadeRowId, lineId, field, value) => {
    setShadeLines((current) =>
      current.map((shade) => {
        if (shade.id !== shadeRowId) return shade;

        return {
          ...shade,

          lines: shade.lines.map((line) =>
            line.id === lineId
              ? {
                  ...line,

                  [field]:
                    field === "quantity"
                      ? Math.max(1, Number(value) || 1)
                      : value,
                }
              : line,
          ),
        };
      }),
    );
  };

  const handleProductChange = (value) => {
    setProductId(value);

    setShadeId("");
  };

  const placeOrder = (event) => {
    event.preventDefault();

    if (!selectedDealer) {
      alert("Please select a dealer.");

      return;
    }

    if (shadeLines.length === 0) {
      alert("Please add at least one shade with pack size and quantity.");

      return;
    }

    const invalid = shadeLines.some((shade) =>
      shade.lines.some((line) => !line.packSize || Number(line.quantity) < 1),
    );

    if (invalid) {
      alert("Please select pack size and quantity for every item.");

      return;
    }

    const order = {
      id: `PRK-${Date.now().toString().slice(-6)}`,

      dealerId: selectedDealer.id,

      dealerName: selectedDealer.name,

      salespersonId,

      items: shadeLines,

      totalQuantity,

      notes: notes.trim(),

      status: "PENDING",

      createdAt: new Date().toISOString(),
    };

    const existingOrders = JSON.parse(
      localStorage.getItem("pareekx_orders") || "[]",
    );

    localStorage.setItem(
      "pareekx_orders",

      JSON.stringify([...existingOrders, order]),
    );

    alert(`Order ${order.id} placed successfully.`);

    navigate("/salesperson/orders");
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB] p-4 md:p-6 lg:p-8">
           {" "}
      <div className="mx-auto max-w-[1400px]">
               {" "}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                   {" "}
          <div>
                       {" "}
            <button
              type="button"
              onClick={() => navigate("/salesperson/orders")}
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#B5220E]"
            >
                            <ArrowLeft size={17} />              Back to Orders
                         {" "}
            </button>
                       {" "}
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B5220E]">
                            Salesperson Portal            {" "}
            </p>
                       {" "}
            <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                            Create New Order            {" "}
            </h1>
                       {" "}
            <p className="mt-1 text-sm text-slate-500">
                            Select a dealer and add products, shades, pack sizes
              and               quantities.            {" "}
            </p>
                     {" "}
          </div>
                   {" "}
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
                        <Package size={18} className="text-[#B5220E]" />       
                Total Qty:            {" "}
            <span className="font-bold text-slate-900">{totalQuantity}</span>   
                 {" "}
          </div>
                 {" "}
        </div>
               {" "}
        <form onSubmit={placeOrder}>
                   {" "}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)\\\_380px]">
                       {" "}
            <div className="space-y-6">
                           {" "}
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
                               {" "}
                <div className="mb-5 flex items-center gap-3">
                                   {" "}
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B5220E]/10 text-[#B5220E]">
                                        <UserRound size={19} />               
                     {" "}
                  </div>
                                   {" "}
                  <div>
                                       {" "}
                    <h2 className="font-bold text-slate-900">
                                            Dealer Details                  
                       {" "}
                    </h2>
                                       {" "}
                    <p className="text-xs text-slate-500">
                                            Choose the dealer placing this
                      order.                    {" "}
                    </p>
                                     {" "}
                  </div>
                                 {" "}
                </div>
                               {" "}
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Select Dealer \\\*                {" "}
                </label>
                               {" "}
                <div className="relative">
                                   {" "}
                  <select
                    required
                    value={dealerId}
                    onChange={(e) => setDealerId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#B5220E] focus:bg-white focus:ring-4 focus:ring-[#B5220E]/10"
                  >
                                        <option value="">Select dealer</option> 
                                     {" "}
                    {dealers.map((dealer) => (
                      <option key={dealer.id} value={dealer.id}>
                                                {dealer.name} — {dealer.city}   
                                         {" "}
                      </option>
                    ))}
                                     {" "}
                  </select>
                                   {" "}
                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                                 {" "}
                </div>{" "}
                {dealers.length === 0 && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                    No dealers are assigned to this salesperson yet.
                  </div>
                )}
                {selectedDealer && (
                  <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
                                       {" "}
                    <div>
                                           {" "}
                      <p className="text-xs text-slate-400">Contact Person</p> 
                                         {" "}
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                                                {selectedDealer.contactPerson} 
                                           {" "}
                      </p>
                                         {" "}
                    </div>
                                       {" "}
                    <div>
                                           {" "}
                      <p className="text-xs text-slate-400">Phone</p>           
                               {" "}
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                                                {selectedDealer.phone}         
                                   {" "}
                      </p>
                                         {" "}
                    </div>
                                       {" "}
                    <div>
                                           {" "}
                      <p className="text-xs text-slate-400">City</p>           
                               {" "}
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                                                {selectedDealer.city}           
                                 {" "}
                      </p>
                                         {" "}
                    </div>
                                     {" "}
                  </div>
                )}
                             {" "}
              </section>
                           {" "}
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
                               {" "}
                <div className="mb-5">
                                   {" "}
                  <h2 className="font-bold text-slate-900">Add Products</h2>   
                               {" "}
                  <p className="mt-1 text-xs text-slate-500">
                                        Add a product shade first, then
                    configure multiple pack                     sizes and
                    quantities.                  {" "}
                  </p>
                                 {" "}
                </div>
                               {" "}
                <div className="grid gap-4 md:grid-cols-2">
                                   {" "}
                  <div>
                                       {" "}
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Product \\\*                  
                       {" "}
                    </label>
                                       {" "}
                    <select
                      value={productId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700 outline-none focus:border-[#B5220E] focus:bg-white focus:ring-4 focus:ring-[#B5220E]/10"
                    >
                                           {" "}
                      <option value="">Select product</option>                 
                         {" "}
                      {PRODUCTS.map((product) => (
                        <option key={product.id} value={product.id}>
                                                    {product.name} (
                          {product.code})                        {" "}
                        </option>
                      ))}
                                         {" "}
                    </select>
                                     {" "}
                  </div>
                                   {" "}
                  <div>
                                       {" "}
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Shade / Color \\\*                  
                       {" "}
                    </label>
                                       {" "}
                    <select
                      value={shadeId}
                      onChange={(e) => setShadeId(e.target.value)}
                      disabled={!selectedProduct}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-[#B5220E] focus:bg-white focus:ring-4 focus:ring-[#B5220E]/10"
                    >
                                           {" "}
                      <option value="">
                                               {" "}
                        {selectedProduct
                          ? "Select shade"
                          : "Select product first"}
                                             {" "}
                      </option>
                                           {" "}
                      {selectedProduct?.shades.map((shade) => (
                        <option key={shade.id} value={shade.id}>
                                                    {shade.name} ({shade.code})
                                                 {" "}
                        </option>
                      ))}
                                         {" "}
                    </select>
                                     {" "}
                  </div>
                                 {" "}
                </div>
                               {" "}
                <button
                  type="button"
                  onClick={addShade}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#B5220E] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#981d0c]"
                >
                                    <Plus size={17} />                  Add
                  Shade                {" "}
                </button>
                             {" "}
              </section>
                           {" "}
              {shadeLines.length > 0 && (
                <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
                                   {" "}
                  <div className="mb-5 flex items-center justify-between gap-3">
                                       {" "}
                    <div>
                                           {" "}
                      <h2 className="font-bold text-slate-900">
                                                Order Items                    
                         {" "}
                      </h2>
                                           {" "}
                      <p className="mt-1 text-xs text-slate-500">
                                                Each shade can have multiple
                        pack sizes.                      {" "}
                      </p>
                                         {" "}
                    </div>
                                       {" "}
                    <span className="rounded-full bg-[#B5220E]/10 px-3 py-1.5 text-xs font-bold text-[#B5220E]">
                                            {shadeLines.length} Shade          
                                  {shadeLines.length !== 1 ? "s" : ""}         
                               {" "}
                    </span>
                                     {" "}
                  </div>
                                   {" "}
                  <div className="space-y-5">
                                       {" "}
                    {shadeLines.map((shade) => (
                      <div
                        key={shade.id}
                        className="rounded-2xl border border-slate-200 p-4 md:p-5"
                      >
                                               {" "}
                        <div className="flex items-start justify-between gap-3">
                                                   {" "}
                          <div>
                                                       {" "}
                            <p className="text-xs font-bold uppercase tracking-wide text-[#B5220E]">
                                                            {shade.productName} 
                                                       {" "}
                            </p>
                                                       {" "}
                            <h3 className="mt-1 font-bold text-slate-900">
                                                            {shade.shadeName}   
                                                     {" "}
                            </h3>
                                                       {" "}
                            <p className="mt-1 text-xs text-slate-400">
                                                            Shade Code:{" "}
                              {shade.shadeCode}                           {" "}
                            </p>
                                                     {" "}
                          </div>
                                                   {" "}
                          <button
                            type="button"
                            onClick={() => removeShade(shade.id)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Remove shade"
                          >
                                                        <X size={18} />         
                                           {" "}
                          </button>
                                                 {" "}
                        </div>
                                               {" "}
                        <div className="mt-4 space-y-3">
                                                   {" "}
                          {shade.lines.map((line, index) => (
                            <div
                              key={line.id}
                              className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_180px_auto] sm:items-end"
                            >
                                                           {" "}
                              <div>
                                                               {" "}
                                <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                                                                    Pack Size  
                                                               {" "}
                                </label>
                                                               {" "}
                                <select
                                  value={line.packSize}
                                  onChange={(e) =>
                                    updatePackLine(
                                      shade.id,

                                      line.id,

                                      "packSize",

                                      e.target.value,
                                    )
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#B5220E]"
                                >
                                                                   {" "}
                                  <option value="">Select pack size</option>   
                                                               {" "}
                                  {PACK_SIZES.map((pack) => (
                                    <option key={pack} value={pack}>
                                                                           {" "}
                                      {pack}                                 
                                       {" "}
                                    </option>
                                  ))}
                                                                 {" "}
                                </select>
                                                             {" "}
                              </div>
                                                           {" "}
                              <div>
                                                               {" "}
                                <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                                                                    Quantity    
                                                             {" "}
                                </label>
                                                               {" "}
                                <input
                                  type="number"
                                  min="1"
                                  value={line.quantity}
                                  onChange={(e) =>
                                    updatePackLine(
                                      shade.id,

                                      line.id,

                                      "quantity",

                                      e.target.value,
                                    )
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#B5220E]"
                                />
                                                             {" "}
                              </div>
                                                           {" "}
                              <button
                                type="button"
                                disabled={shade.lines.length === 1}
                                onClick={() =>
                                  removePackSize(shade.id, line.id)
                                }
                                className="rounded-lg border border-slate-200 p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                                title={`Remove pack ${index + 1}`}
                              >
                                                               {" "}
                                <Trash2 size={17} />                           
                                 {" "}
                              </button>
                                                         {" "}
                            </div>
                          ))}
                                                 {" "}
                        </div>
                                               {" "}
                        <button
                          type="button"
                          onClick={() => addPackSize(shade.id)}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#B5220E] hover:underline"
                        >
                                                    <Plus size={16} />         
                                          Add Another Pack Size                
                                 {" "}
                        </button>
                                             {" "}
                      </div>
                    ))}
                                     {" "}
                  </div>
                                 {" "}
                </section>
              )}
                           {" "}
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
                               {" "}
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Order Notes                {" "}
                </label>
                               {" "}
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special instructions for this order..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#B5220E] focus:bg-white focus:ring-4 focus:ring-[#B5220E]/10"
                />
                             {" "}
              </section>
                         {" "}
            </div>
                       {" "}
            <aside className="lg:sticky lg:top-6 lg:h-fit">
                           {" "}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
                               {" "}
                <div className="flex items-center justify-between">
                                   {" "}
                  <div>
                                       {" "}
                    <h2 className="font-bold text-slate-900">Order Summary</h2> 
                                     {" "}
                    <p className="mt-1 text-xs text-slate-500">
                                            Review before placing.              
                           {" "}
                    </p>
                                     {" "}
                  </div>
                                   {" "}
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B5220E]/10 text-[#B5220E]">
                                        <Package size={19} />               
                     {" "}
                  </div>
                                 {" "}
                </div>
                               {" "}
                <div className="my-5 border-t border-slate-100" />             
                 {" "}
                <div className="space-y-4">
                                   {" "}
                  <div className="flex justify-between gap-4 text-sm">
                                       {" "}
                    <span className="text-slate-500">Dealer</span>             
                         {" "}
                    <span className="text-right font-semibold text-slate-800">
                                           {" "}
                      {selectedDealer?.name || "Not selected"}                 
                       {" "}
                    </span>
                                     {" "}
                  </div>
                                   {" "}
                  <div className="flex justify-between gap-4 text-sm">
                                       {" "}
                    <span className="text-slate-500">Shades</span>             
                         {" "}
                    <span className="font-semibold text-slate-800">
                                            {shadeLines.length}                 
                       {" "}
                    </span>
                                     {" "}
                  </div>
                                   {" "}
                  <div className="flex justify-between gap-4 text-sm">
                                       {" "}
                    <span className="text-slate-500">Pack Entries</span>       
                               {" "}
                    <span className="font-semibold text-slate-800">
                                           {" "}
                      {shadeLines.reduce(
                        (total, shade) => total + shade.lines.length,

                        0,
                      )}
                                         {" "}
                    </span>
                                     {" "}
                  </div>
                                   {" "}
                  <div className="flex justify-between gap-4 rounded-xl bg-slate-50 p-4">
                                       {" "}
                    <span className="font-semibold text-slate-600">
                                            Total Quantity                  
                       {" "}
                    </span>
                                       {" "}
                    <span className="text-xl font-bold text-[#B5220E]">
                                            {totalQuantity}                 
                       {" "}
                    </span>
                                     {" "}
                  </div>
                                 {" "}
                </div>
                               {" "}
                {shadeLines.length > 0 && (
                  <div className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-1">
                                       {" "}
                    {shadeLines.map((shade) => (
                      <div
                        key={shade.id}
                        className="rounded-xl border border-slate-100 p-3"
                      >
                                               {" "}
                        <p className="text-sm font-bold text-slate-800">
                                                    {shade.shadeName}           
                                     {" "}
                        </p>
                                               {" "}
                        {shade.lines.map((line) => (
                          <div
                            key={line.id}
                            className="mt-2 flex justify-between text-xs text-slate-500"
                          >
                                                       {" "}
                            <span>{line.packSize || "Pack not selected"}</span> 
                                                     {" "}
                            <span className="font-bold text-slate-700">
                                                            × {line.quantity}   
                                                     {" "}
                            </span>
                                                     {" "}
                          </div>
                        ))}
                                             {" "}
                      </div>
                    ))}
                                     {" "}
                  </div>
                )}
                               {" "}
                <button
                  type="submit"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#B5220E] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#981d0c]"
                >
                                    <Check size={18} />                  Place
                  Order                {" "}
                </button>
                               {" "}
                <button
                  type="button"
                  onClick={() => navigate("/salesperson/orders")}
                  className="mt-3 w-full rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                                    Cancel                {" "}
                </button>
                             {" "}
              </div>
                         {" "}
            </aside>
                     {" "}
          </div>
                 {" "}
        </form>
             {" "}
      </div>
         {" "}
    </div>
  );
}
