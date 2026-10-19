import { useEffect, useMemo, useState } from "react";

import {
  getDealers,
  getDealersBySalesperson,
  saveDealers,
} from "../../data/pareekxStore";

import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { createRecord, watchCollection } from "../../services/firebaseData";

import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Trash2,
  Truck,
  UserPlus,
  X,
} from "lucide-react";

/* =========================================================

   MOCK DATA

   Backend integration baad mein yahin se replace hogi

\========================================================= */

const DEALERS = [
  {
    id: 1,

    name: "Raipur Paint Centre",

    phone: "9876543210",

    email: "raipurpaint@example.com",

    address: "Shop 12, Ganj Road",

    city: "Raipur",

    state: "Chhattisgarh",

    pincode: "492001",
  },

  {
    id: 2,

    name: "Sharma Hardware & Paints",

    phone: "9765432109",

    email: "sharmahardware@example.com",

    address: "Main Market",

    city: "Bilaspur",

    state: "Chhattisgarh",

    pincode: "495001",
  },

  {
    id: 3,

    name: "New Look Interiors",

    phone: "9654321098",

    email: "newlook@example.com",

    address: "Civil Lines",

    city: "Nagpur",

    state: "Maharashtra",

    pincode: "440001",
  },
];

const TRANSPORTS = [
  {
    id: 1,

    name: "Shree Balaji Transport",

    phone: "9876500011",

    route: "Raipur → Bilaspur",
  },

  {
    id: 2,

    name: "Mahadev Logistics",

    phone: "9876500022",

    route: "Raipur → Nagpur",
  },

  {
    id: 3,

    name: "Patel Transport",

    phone: "9876500033",

    route: "Raipur → Bhopal",
  },
];


/* =========================================================

   Helpers

\========================================================= */

const createPack = (packSize = "") => ({
  id: Date.now() + Math.random(),

  packSize,

  quantity: 0,
});

const createShade = () => ({
  id: Date.now() + Math.random(),

  shade: "",

  customShade: "",

  packs: [createPack()],
});

const createProduct = () => ({
  id: Date.now() + Math.random(),

  productId: "",

  shades: [createShade()],
});

const emptyDealer = {
  name: "",

  phone: "",

  email: "",

  address: "",

  city: "",

  state: "",

  pincode: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#B5220E] focus:ring-2 focus:ring-[#B5220E]/10";

const labelClass = "mb-2 block text-sm font-medium text-slate-700";

/* =========================================================

   Component

\========================================================= */

export default function NewOrder({ role = "salesperson" }) {
  const navigate = useNavigate();

  const isDealer = role === "dealer";
  const dashboardPath = isDealer
    ? "/dealer/dashboard"
    : "/salesperson/dashboard";

  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    storedUser = null;
  }

  const salespersonId =
    storedUser?.salespersonId ??
    storedUser?.salesPersonId ??
    storedUser?.id ??
    storedUser?.userId ??
    1;

  const fallbackDealer = DEALERS[0];
  const loggedInDealer =
    isDealer && storedUser && typeof storedUser === "object"
      ? {
          ...fallbackDealer,
          ...storedUser,
          name: storedUser.name || storedUser.dealerName || fallbackDealer.name,
        }
      : fallbackDealer;

  const [dealerList, setDealerList] = useState([]);

  const [selectedDealerId, setSelectedDealerId] = useState("");

  const [dealerSearch, setDealerSearch] = useState("");

  const [showNewDealer, setShowNewDealer] = useState(false);

  const [newDealer, setNewDealer] = useState(emptyDealer);

  const [products, setProducts] = useState([createProduct()]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    return watchCollection(
      "products",
      (items) => {
        const activeProducts = items
          .filter((item) => item.active !== false)
          .map((item) => ({
            ...item,
            shades: (Array.isArray(item.shades) ? item.shades : [])
              .map((shade) => typeof shade === "string" ? shade : shade?.name)
              .filter(Boolean),
            packSizes: Array.isArray(item.packSizes) ? item.packSizes : [],
          }));
        setCatalogProducts(activeProducts);
        setCatalogLoading(false);
        setCatalogError("");
      },
      (error) => {
        console.error("Failed to load product catalogue", error);
        setCatalogError("Products could not be loaded from Firebase. Please check Firestore rules and try again.");
        setCatalogLoading(false);
      },
    );
  }, []);


  const [deliveryType, setDeliveryType] = useState("direct");

  const [selectedTransport, setSelectedTransport] = useState("");

  const [remark, setRemark] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);

  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const storedDealers = getDealers();

    if (isDealer) {
      setDealerList(storedDealers.length ? storedDealers : DEALERS);
      return;
    }

    const assignedDealers = getDealersBySalesperson(salespersonId);
    setDealerList(assignedDealers.length ? assignedDealers : DEALERS);
  }, [isDealer, salespersonId]);

  /* =========================================================
     Dealer
  ========================================================= */

  const selectedDealer = dealerList.find(
    (dealer) => String(dealer.id) === String(selectedDealerId),
  );

  const summaryDealer = isDealer
    ? loggedInDealer
    : showNewDealer
      ? newDealer
      : selectedDealer;

  const filteredDealers = useMemo(() => {
    const search = dealerSearch.toLowerCase().trim();

    if (!search) return dealerList;

    return dealerList.filter(
      (dealer) =>
        dealer.name.toLowerCase().includes(search) ||
        dealer.phone.includes(search) ||
        dealer.city.toLowerCase().includes(search),
    );
  }, [dealerSearch, dealerList]);

  const handleDealerSelect = (id) => {
    setSelectedDealerId(id);

    setShowNewDealer(false);
  };

  const handleNewDealerChange = (field, value) => {
    setNewDealer((prev) => ({
      ...prev,

      [field]: value,
    }));
  }; /* =========================================================

     Products

  ========================================================= */

  const addProduct = () => {
    setProducts((prev) => [...prev, createProduct()]);
  };

  const removeProduct = (productId) => {
    if (products.length === 1) return;

    setProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  const updateProduct = (productId, field, value) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,

              [field]: value,

              ...(field === "productId"
                ? {
                    shades: [
                      {
                        ...createShade(),

                        shade: "",
                      },
                    ],
                  }
                : {}),
            }
          : product,
      ),
    );
  }; /* =========================================================

     Shades

  ========================================================= */

  const addShade = (productId) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,

              shades: [...product.shades, createShade()],
            }
          : product,
      ),
    );
  };

  const removeShade = (productId, shadeId) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== productId) return product;

        if (product.shades.length === 1) return product;

        return {
          ...product,

          shades: product.shades.filter((shade) => shade.id !== shadeId),
        };
      }),
    );
  };

  const updateShade = (
    productId,

    shadeId,

    field,

    value,
  ) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,

              shades: product.shades.map((shade) =>
                shade.id === shadeId
                  ? {
                      ...shade,

                      [field]: value,

                      ...(field === "shade" && value !== "other"
                        ? { customShade: "" }
                        : {}),
                    }
                  : shade,
              ),
            }
          : product,
      ),
    );
  }; /* =========================================================

     Pack Sizes

  ========================================================= */

  const addPack = (productId, shadeId) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,

              shades: product.shades.map((shade) =>
                shade.id === shadeId
                  ? {
                      ...shade,

                      packs: [...shade.packs, createPack()],
                    }
                  : shade,
              ),
            }
          : product,
      ),
    );
  };

  const removePack = (productId, shadeId, packId) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,

              shades: product.shades.map((shade) => {
                if (shade.id !== shadeId) return shade;

                if (shade.packs.length === 1) return shade;

                return {
                  ...shade,

                  packs: shade.packs.filter((pack) => pack.id !== packId),
                };
              }),
            }
          : product,
      ),
    );
  };

  const updatePack = (
    productId,

    shadeId,

    packId,

    field,

    value,
  ) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,

              shades: product.shades.map((shade) =>
                shade.id === shadeId
                  ? {
                      ...shade,

                      packs: shade.packs.map((pack) =>
                        pack.id === packId
                          ? {
                              ...pack,

                              [field]:
                                field === "quantity"
                                  ? Math.max(
                                      0,

                                      Number(value),
                                    )
                                  : value,
                            }
                          : pack,
                      ),
                    }
                  : shade,
              ),
            }
          : product,
      ),
    );
  }; /* =========================================================

     Summary Calculations

  ========================================================= */

  const totalQuantity = products.reduce(
    (productTotal, product) =>
      productTotal +
      product.shades.reduce(
        (shadeTotal, shade) =>
          shadeTotal +
          shade.packs.reduce(
            (packTotal, pack) => packTotal + Number(pack.quantity || 0),

            0,
          ),

        0,
      ),

    0,
  );

  const totalProductLines = products.reduce(
    (total, product) =>
      total +
      product.shades.reduce(
        (shadeTotal, shade) => shadeTotal + shade.packs.length,

        0,
      ),

    0,
  ); /* =========================================================

     Validation

  ========================================================= */

  const validateOrder = () => {
    if (!isDealer && !selectedDealerId && !showNewDealer) {
      alert("Please select a dealer or add a new dealer.");

      return false;
    }

    if (showNewDealer) {
      if (
        !newDealer.name.trim() ||
        !newDealer.phone.trim() ||
        !newDealer.address.trim()
      ) {
        alert("Please fill Dealer Name, Contact Number and Address.");

        return false;
      }
    }

    if (catalogLoading || catalogError || catalogProducts.length === 0) {
      alert(catalogLoading ? "Please wait while products load." : "No active Firebase products are available. Please contact the administrator.");
      return false;
    }

    for (const product of products) {
      if (!product.productId) {
        alert("Please select a product.");

        return false;
      }

      for (const shade of product.shades) {
        if (!shade.shade) {
          alert("Please select a shade.");

          return false;
        }

        if (shade.shade === "other" && !shade.customShade.trim()) {
          alert("Please enter the new shade name.");

          return false;
        }

        for (const pack of shade.packs) {
          if (!pack.packSize) {
            alert("Please select pack size.");

            return false;
          }

          if (Number(pack.quantity) < 1) {
            alert("Quantity must be at least 1.");

            return false;
          }
        }
      }
    }

    if (deliveryType === "transport" && !selectedTransport) {
      alert("Please select a transport.");

      return false;
    }

    return true;
  }; /* =========================================================

     Submit

  ========================================================= */

  const handleSubmit = async () => {
    if (!validateOrder() || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {

    const generatedOrderId = `PRK-${Date.now()

      .toString()

      .slice(-6)}`;

    let finalDealer;

    if (isDealer) {
      finalDealer = {
        ...loggedInDealer,
        isNew: false,
      };
    } else if (showNewDealer) {
      const existingDealers = getDealers();
      const newDealerId =
        existingDealers.reduce(
          (maxId, dealer) => Math.max(maxId, Number(dealer.id) || 0),
          0,
        ) + 1;

      finalDealer = {
        ...newDealer,
        id: newDealerId,
        salespersonId: Number(salespersonId),
        active: true,
        totalOrders: 0,
        totalQuantity: 0,
        lastOrder: new Date().toISOString().slice(0, 10),
        isNew: true,
      };

      saveDealers([...existingDealers, finalDealer]);
    } else {
      finalDealer = {
        ...selectedDealer,
        isNew: false,
      };
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Your login session has expired. Please sign in again.");
    }

    const normalizedProducts = products.map((product) => {
      const productData = catalogProducts.find(
        (p) => String(p.id) === String(product.productId),
      );
      return {
        productId: product.productId,
        productName: productData?.name || "",
        shades: product.shades.map((shade) => ({
          shade: shade.shade === "other" ? shade.customShade : shade.shade,
          packs: shade.packs.map((pack) => ({
            packSize: pack.packSize,
            quantity: Number(pack.quantity),
          })),
        })),
      };
    });

    const orderPayload = {
      orderId: generatedOrderId,
      dealer: finalDealer,
      dealerUid: isDealer ? currentUser.uid : (finalDealer?.uid || finalDealer?.userUid || null),
      dealerId: finalDealer?.id ?? null,
      dealerName: finalDealer?.name || "",
      salespersonUid: isDealer ? (finalDealer?.salespersonUid || finalDealer?.salespersonUID || null) : currentUser.uid,
      salespersonId: isDealer ? (finalDealer?.salespersonId ?? null) : Number(salespersonId),
      salespersonName: isDealer ? (finalDealer?.salespersonName || "") : (storedUser?.name || "Salesperson"),
      createdBy: storedUser?.name || (isDealer ? finalDealer?.name : "Salesperson") || "User",
      createdByRole: role.toUpperCase(),
      createdByUserId: currentUser.uid,
      products: normalizedProducts,
      items: normalizedProducts.flatMap((product) => product.shades.flatMap((shade) => shade.packs.map((pack) => ({
        product: product.productName,
        shade: shade.shade,
        packSize: pack.packSize,
        quantity: Number(pack.quantity),
      })))),
      delivery: {
        type: deliveryType,
        transport: deliveryType === "transport" ? selectedTransport : null,
      },
      deliveryType: deliveryType === "transport" ? "TRANSPORT" : "DIRECT",
      transport: deliveryType === "transport" ? selectedTransport : "",
      remark,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      totalQuantity,
      totalProductLines,
    };

    // Firestore security rules require the authenticated user to be linked to the order.
    if (!orderPayload.dealerUid && !orderPayload.salespersonUid) {
      throw new Error("The order must be linked to the signed-in dealer or salesperson.");
    }
    const firestoreId = await createRecord("orders", orderPayload);
    const localOrder = { ...orderPayload, id: generatedOrderId, firestoreId };
    const existingOrders = JSON.parse(localStorage.getItem("pareekx_orders") || "[]");
    localStorage.setItem("pareekx_orders", JSON.stringify([localOrder, ...existingOrders]));
    window.dispatchEvent(new Event("pareekx-orders-updated"));
    setOrderId(generatedOrderId);
    setShowSuccess(true);
    } catch (error) {
      console.error("Failed to create order in Firestore:", error);
      setSubmitError(error?.code === "permission-denied"
        ? "Firebase permission denied. Check the Firestore orders rules and user profile."
        : (error?.message || "Could not place the order. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }; /* =========================================================

     Success Screen

  ========================================================= */

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#F5F0EB] p-6">
        {" "}
        <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center">
          {" "}
          <div className="w-full rounded-3xl bg-white p-8 text-center shadow-xl">
            {" "}
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              {" "}
              <CheckCircle2 size={42} className="text-green-600" />{" "}
            </div>{" "}
            <h1 className="text-3xl font-bold text-slate-900">
              Order Placed Successfully{" "}
            </h1>{" "}
            <p className="mt-3 text-slate-500">
              Your order has been created successfully.{" "}
            </p>{" "}
            <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-slate-50 p-5">
              {" "}
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Order ID{" "}
              </p>{" "}
              <p className="mt-1 text-2xl font-bold text-[#B5220E]">
                {orderId}{" "}
              </p>{" "}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {" "}
                <div>
                  {" "}
                  <p className="text-xs text-slate-400">Product Lines </p>{" "}
                  <p className="font-semibold text-slate-800">
                    {totalProductLines}{" "}
                  </p>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <p className="text-xs text-slate-400">Total Quantity </p>{" "}
                  <p className="font-semibold text-slate-800">
                    {totalQuantity}{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-left text-sm text-blue-800">
              <strong>WhatsApp:</strong> Actual WhatsApp notifications will be
              connected with the backend/API in the next phase.{" "}
            </div>{" "}
            <button
              onClick={() => navigate(dashboardPath)}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#B5220E] px-6 py-3 font-semibold text-white transition hover:bg-[#941b0b]"
            >
              Back to Dashboard{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  } /* =========================================================

     Main UI

  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      {/* Header */}{" "}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        {" "}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          {" "}
          <div className="flex items-center gap-4">
            {" "}
            <button
              onClick={() => navigate(dashboardPath)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={19} />{" "}
            </button>{" "}
            <div>
              {" "}
              <h1 className="text-xl font-bold text-slate-900">
                New Order{" "}
              </h1>{" "}
              <p className="text-sm text-slate-500">Create a new order </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="hidden items-center gap-2 rounded-xl bg-[#B5220E]/5 px-4 py-2 text-sm font-medium text-[#B5220E] sm:flex">
            <Package size={17} /> Pareek{" "}
          </div>{" "}
        </div>{" "}
      </header>
      {/* Page */}{" "}
      <main className="mx-auto max-w-7xl px-5 py-7">
        {" "}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          {" "}
          {/* =================================================

              LEFT

          ================================================= */}{" "}
          <div className="space-y-6">
            {/* Dealer / Account Details */}
            {isDealer && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    My Dealer Details
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Order will be placed from your dealer account.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
                  <InfoItem
                    icon={<Package size={16} />}
                    label="Dealer"
                    value={loggedInDealer.name}
                  />
                  <InfoItem
                    icon={<Phone size={16} />}
                    label="Contact"
                    value={loggedInDealer.phone}
                  />
                  <InfoItem
                    icon={<Mail size={16} />}
                    label="Email"
                    value={loggedInDealer.email}
                  />
                  <InfoItem
                    icon={<MapPin size={16} />}
                    label="Location"
                    value={`${loggedInDealer.city}, ${loggedInDealer.state}`}
                  />
                  <div className="md:col-span-2">
                    <InfoItem
                      icon={<MapPin size={16} />}
                      label="Delivery Address"
                      value={`${loggedInDealer.address}, ${loggedInDealer.city}, ${loggedInDealer.state} - ${loggedInDealer.pincode}`}
                    />
                  </div>
                </div>
              </section>
            )}
            {!isDealer && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                {" "}
                <div className="mb-5 flex items-center justify-between">
                  {" "}
                  <div>
                    {" "}
                    <h2 className="text-lg font-bold text-slate-900">
                      Dealer Details{" "}
                    </h2>{" "}
                    <p className="mt-1 text-sm text-slate-500">
                      Select an existing dealer or add a new one.{" "}
                    </p>{" "}
                  </div>{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewDealer((prev) => !prev);

                      setSelectedDealerId("");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#B5220E] px-4 py-2 text-sm font-semibold text-[#B5220E] transition hover:bg-[#B5220E] hover:text-white"
                  >
                    {" "}
                    {showNewDealer ? (
                      <>
                        <X size={16} />
                        Cancel New Dealer{" "}
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Add New Dealer{" "}
                      </>
                    )}{" "}
                  </button>{" "}
                </div>{" "}
                {!showNewDealer ? (
                  <>
                    {" "}
                    <div className="relative mb-3">
                      {" "}
                      <input
                        type="text"
                        value={dealerSearch}
                        onChange={(e) => setDealerSearch(e.target.value)}
                        placeholder="Search dealer by name, phone or city..."
                        className={inputClass}
                      />{" "}
                    </div>{" "}
                    <div className="relative">
                      {" "}
                      <select
                        value={selectedDealerId}
                        onChange={(e) => handleDealerSelect(e.target.value)}
                        className={`${inputClass} appearance-none pr-10`}
                      >
                        {" "}
                        <option value="">Select Existing Dealer </option>{" "}
                        {filteredDealers.map((dealer) => (
                          <option key={dealer.id} value={dealer.id}>
                            {dealer.name} — {dealer.city}{" "}
                          </option>
                        ))}{" "}
                      </select>{" "}
                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />{" "}
                    </div>{" "}
                    {selectedDealer && (
                      <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
                        {" "}
                        <InfoItem
                          icon={<Package size={16} />}
                          label="Dealer"
                          value={selectedDealer.name}
                        />{" "}
                        <InfoItem
                          icon={<Phone size={16} />}
                          label="Contact"
                          value={selectedDealer.phone}
                        />{" "}
                        <InfoItem
                          icon={<Mail size={16} />}
                          label="Email"
                          value={selectedDealer.email}
                        />{" "}
                        <InfoItem
                          icon={<MapPin size={16} />}
                          label="Location"
                          value={`${selectedDealer.city}, ${selectedDealer.state}`}
                        />{" "}
                        <div className="md:col-span-2">
                          {" "}
                          <InfoItem
                            icon={<MapPin size={16} />}
                            label="Delivery Address"
                            value={`${selectedDealer.address}, ${selectedDealer.city}, ${selectedDealer.state} - ${selectedDealer.pincode}`}
                          />{" "}
                        </div>{" "}
                      </div>
                    )}{" "}
                  </>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {" "}
                    <div>
                      {" "}
                      <label className={labelClass}>
                        Dealer / Shop Name *{" "}
                      </label>{" "}
                      <input
                        value={newDealer.name}
                        onChange={(e) =>
                          handleNewDealerChange(
                            "name",

                            e.target.value,
                          )
                        }
                        placeholder="e.g. Gupta Paint House"
                        className={inputClass}
                      />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className={labelClass}>
                        Contact Number *{" "}
                      </label>{" "}
                      <input
                        value={newDealer.phone}
                        onChange={(e) =>
                          handleNewDealerChange(
                            "phone",

                            e.target.value,
                          )
                        }
                        placeholder="10-digit number"
                        className={inputClass}
                      />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className={labelClass}>Email </label>{" "}
                      <input
                        type="email"
                        value={newDealer.email}
                        onChange={(e) =>
                          handleNewDealerChange(
                            "email",

                            e.target.value,
                          )
                        }
                        placeholder="dealer@email.com"
                        className={inputClass}
                      />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className={labelClass}>Pincode </label>{" "}
                      <input
                        value={newDealer.pincode}
                        onChange={(e) =>
                          handleNewDealerChange(
                            "pincode",

                            e.target.value,
                          )
                        }
                        placeholder="492001"
                        className={inputClass}
                      />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className={labelClass}>City </label>{" "}
                      <input
                        value={newDealer.city}
                        onChange={(e) =>
                          handleNewDealerChange(
                            "city",

                            e.target.value,
                          )
                        }
                        placeholder="Raipur"
                        className={inputClass}
                      />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className={labelClass}>State </label>{" "}
                      <input
                        value={newDealer.state}
                        onChange={(e) =>
                          handleNewDealerChange(
                            "state",

                            e.target.value,
                          )
                        }
                        placeholder="Chhattisgarh"
                        className={inputClass}
                      />{" "}
                    </div>{" "}
                    <div className="md:col-span-2">
                      {" "}
                      <label className={labelClass}>
                        Full Delivery Address *{" "}
                      </label>{" "}
                      <textarea
                        rows="3"
                        value={newDealer.address}
                        onChange={(e) =>
                          handleNewDealerChange(
                            "address",

                            e.target.value,
                          )
                        }
                        placeholder="Shop number, street, landmark..."
                        className={inputClass}
                      />{" "}
                    </div>{" "}
                  </div>
                )}{" "}
              </section>
            )}
            {/* Products */}{" "}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {" "}
              <div className="mb-6 flex items-center justify-between">
                {" "}
                <div>
                  {" "}
                  <h2 className="text-lg font-bold text-slate-900">
                    Products & Quantities{" "}
                  </h2>{" "}
                  <p className="mt-1 text-sm text-slate-500">
                    Add products, shades, pack sizes and quantities.{" "}
                  </p>{" "}
                </div>{" "}
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {products.length} Product{" "}
                  {products.length !== 1 ? "s" : ""}{" "}
                </span>{" "}
              </div>{" "}
              {catalogLoading && (
                <p className="mb-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Loading active products from Firebase…</p>
              )}
              {catalogError && (
                <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{catalogError}</p>
              )}
              {!catalogLoading && !catalogError && catalogProducts.length === 0 && (
                <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">No active products available. Ask the administrator to add or activate products first.</p>
              )}
              <div className="space-y-5">
                {" "}
                {products.map((product, productIndex) => {
                  const productData = catalogProducts.find(
                    (p) => String(p.id) === String(product.productId),
                  );

                  return (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                    >
                      {/* Product header */}{" "}
                      <div className="mb-5 flex items-center justify-between">
                        {" "}
                        <div className="flex items-center gap-3">
                          {" "}
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B5220E] text-sm font-bold text-white">
                            {productIndex + 1}{" "}
                          </div>{" "}
                          <div>
                            {" "}
                            <h3 className="font-semibold text-slate-900">
                              Product {productIndex + 1}{" "}
                            </h3>{" "}
                            <p className="text-xs text-slate-500">
                              Product → Shade → Pack Size → Quantity{" "}
                            </p>{" "}
                          </div>{" "}
                        </div>{" "}
                        {products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProduct(product.id)}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 size={17} />{" "}
                          </button>
                        )}{" "}
                      </div>
                      {/* Product select */}{" "}
                      <div className="mb-5">
                        {" "}
                        <label className={labelClass}>Product * </label>{" "}
                        <select
                          value={product.productId}
                          onChange={(e) =>
                            updateProduct(
                              product.id,

                              "productId",

                              e.target.value,
                            )
                          }
                          className={inputClass}
                        >
                          {" "}
                          <option value="">Select Product </option>{" "}
                          {catalogProducts.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({item.unit}){" "}
                            </option>
                          ))}{" "}
                        </select>{" "}
                      </div>
                      {/* Shades */}{" "}
                      {productData && (
                        <div className="space-y-4">
                          {" "}
                          {product.shades.map((shade, shadeIndex) => (
                            <div
                              key={shade.id}
                              className="rounded-xl border border-slate-200 bg-white p-4"
                            >
                              {" "}
                              <div className="mb-4 flex items-center justify-between">
                                {" "}
                                <div className="flex items-center gap-2">
                                  {" "}
                                  <span className="rounded-lg bg-[#B5220E]/10 px-2.5 py-1 text-xs font-bold text-[#B5220E]">
                                    Shade {shadeIndex + 1}{" "}
                                  </span>{" "}
                                </div>{" "}
                                {product.shades.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeShade(
                                        product.id,

                                        shade.id,
                                      )
                                    }
                                    className="text-xs font-semibold text-red-500 hover:text-red-700"
                                  >
                                    Remove Shade{" "}
                                  </button>
                                )}{" "}
                              </div>{" "}
                              {/* Shade select */}{" "}
                              <div className="mb-4">
                                {" "}
                                <label className={labelClass}>
                                  Color / Shade *{" "}
                                </label>{" "}
                                <select
                                  value={shade.shade}
                                  onChange={(e) =>
                                    updateShade(
                                      product.id,

                                      shade.id,

                                      "shade",

                                      e.target.value,
                                    )
                                  }
                                  className={inputClass}
                                >
                                  {" "}
                                  <option value="">Select Shade </option>{" "}
                                  {productData.shades.map((shadeName) => (
                                    <option key={shadeName} value={shadeName}>
                                      {" "}
                                      {shadeName}{" "}
                                    </option>
                                  ))}{" "}
                                  <option value="other">
                                    Other / New Shade{" "}
                                  </option>{" "}
                                </select>{" "}
                              </div>{" "}
                              {/* Custom shade */}{" "}
                              {shade.shade === "other" && (
                                <div className="mb-4">
                                  {" "}
                                  <label className={labelClass}>
                                    New Shade Name *{" "}
                                  </label>{" "}
                                  <input
                                    value={shade.customShade}
                                    onChange={(e) =>
                                      updateShade(
                                        product.id,

                                        shade.id,

                                        "customShade",

                                        e.target.value,
                                      )
                                    }
                                    placeholder="Enter new shade name"
                                    className={inputClass}
                                  />{" "}
                                </div>
                              )}
                              {/* Pack sizes */}{" "}
                              <div>
                                {" "}
                                <div className="mb-3 flex items-center justify-between">
                                  {" "}
                                  <label className="text-sm font-medium text-slate-700">
                                    Pack Size & Quantity{" "}
                                  </label>{" "}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addPack(
                                        product.id,

                                        shade.id,
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B5220E]"
                                  >
                                    {" "}
                                    <Plus size={14} />
                                    Add Pack Size{" "}
                                  </button>{" "}
                                </div>{" "}
                                <div className="space-y-2">
                                  {" "}
                                  {shade.packs.map((pack) => (
                                    <div
                                      key={pack.id}
                                      className="grid grid-cols-[1fr_120px_40px] gap-2"
                                    >
                                      {" "}
                                      <select
                                        value={pack.packSize}
                                        onChange={(e) =>
                                          updatePack(
                                            product.id,

                                            shade.id,

                                            pack.id,

                                            "packSize",

                                            e.target.value,
                                          )
                                        }
                                        className={inputClass}
                                      >
                                        {" "}
                                        <option value="">
                                          Select Pack Size{" "}
                                        </option>{" "}
                                        {productData.packSizes.map((size) => (
                                          <option key={size} value={size}>
                                            {size}{" "}
                                          </option>
                                        ))}{" "}
                                      </select>{" "}
                                      <input
                                        type="number"
                                        min="1"
                                        value={pack.quantity || ""}
                                        onChange={(e) =>
                                          updatePack(
                                            product.id,

                                            shade.id,

                                            pack.id,

                                            "quantity",

                                            e.target.value,
                                          )
                                        }
                                        placeholder="Qty"
                                        className={inputClass}
                                      />{" "}
                                      <button
                                        type="button"
                                        disabled={shade.packs.length === 1}
                                        onClick={() =>
                                          removePack(
                                            product.id,

                                            shade.id,

                                            pack.id,
                                          )
                                        }
                                        className="flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                                      >
                                        <Trash2 size={16} />{" "}
                                      </button>{" "}
                                    </div>
                                  ))}{" "}
                                </div>{" "}
                              </div>{" "}
                            </div>
                          ))}{" "}
                          <button
                            type="button"
                            onClick={() => addShade(product.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#B5220E]/40 px-4 py-2.5 text-sm font-semibold text-[#B5220E] transition hover:bg-[#B5220E]/5"
                          >
                            <Plus size={16} />
                            Add Another Shade{" "}
                          </button>{" "}
                        </div>
                      )}{" "}
                    </div>
                  );
                })}{" "}
              </div>{" "}
              <button
                type="button"
                onClick={addProduct}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#B5220E] hover:bg-[#B5220E]/5 hover:text-[#B5220E]"
              >
                <Plus size={17} /> Add Another Product{" "}
              </button>{" "}
            </section>
            {/* Delivery */}{" "}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {" "}
              <div className="mb-5 flex items-center gap-3">
                {" "}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Truck size={19} />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h2 className="font-bold text-slate-900">Delivery </h2>{" "}
                  <p className="text-sm text-slate-500">
                    Select how this order should be delivered.{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {" "}
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryType("direct");

                    setSelectedTransport("");
                  }}
                  className={`rounded-2xl border p-5 text-left transition ${
                    deliveryType === "direct"
                      ? "border-[#B5220E] bg-[#B5220E]/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {" "}
                  <div className="flex items-center gap-3">
                    {" "}
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
                      <MapPin size={20} />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <p className="font-bold text-slate-900">
                        Direct Delivery{" "}
                      </p>{" "}
                      <p className="mt-1 text-xs text-slate-500">
                        Deliver directly to dealer.{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                </button>{" "}
                <button
                  type="button"
                  onClick={() => setDeliveryType("transport")}
                  className={`rounded-2xl border p-5 text-left transition ${
                    deliveryType === "transport"
                      ? "border-[#B5220E] bg-[#B5220E]/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {" "}
                  <div className="flex items-center gap-3">
                    {" "}
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <Truck size={20} />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <p className="font-bold text-slate-900">
                        Transport Delivery{" "}
                      </p>{" "}
                      <p className="mt-1 text-xs text-slate-500">
                        Send order through transport.{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                </button>{" "}
              </div>{" "}
              {deliveryType === "transport" && (
                <div className="mt-5">
                  {" "}
                  <label className={labelClass}>Select Transport * </label>{" "}
                  <select
                    value={selectedTransport}
                    onChange={(e) => setSelectedTransport(e.target.value)}
                    className={inputClass}
                  >
                    {" "}
                    <option value="">Select Transport </option>{" "}
                    {TRANSPORTS.map((transport) => (
                      <option key={transport.id} value={transport.id}>
                        {transport.name} —{transport.route}{" "}
                      </option>
                    ))}{" "}
                  </select>{" "}
                  {selectedTransport && (
                    <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
                      {" "}
                      {
                        TRANSPORTS.find(
                          (t) => String(t.id) === String(selectedTransport),
                        )?.phone
                      }{" "}
                      ·{" "}
                      {
                        TRANSPORTS.find(
                          (t) => String(t.id) === String(selectedTransport),
                        )?.route
                      }{" "}
                    </div>
                  )}{" "}
                </div>
              )}{" "}
            </section>
            {/* Remark */}{" "}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {" "}
              <div className="mb-4 flex items-center gap-3">
                {" "}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <FileText size={19} />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h2 className="font-bold text-slate-900">
                    Remark / Requirement{" "}
                  </h2>{" "}
                  <p className="text-sm text-slate-500">
                    Add any special instructions for this order.{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <textarea
                rows="5"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Delivery deadline, shade requirement, special instruction, dealer requirement..."
                className={inputClass}
              />{" "}
            </section>{" "}
          </div>{" "}
          {/* =================================================

              RIGHT SUMMARY

          ================================================= */}{" "}
          <aside className="xl:sticky xl:top-24 xl:h-fit">
            {" "}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {" "}
              <div className="bg-[#B5220E] p-5 text-white">
                {" "}
                <p className="text-sm text-white/70">Order Summary </p>{" "}
                <h2 className="mt-1 text-xl font-bold">Pareek Order </h2>{" "}
              </div>{" "}
              <div className="space-y-5 p-5">
                {/* Dealer summary */}{" "}
                <div>
                  {" "}
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Dealer{" "}
                  </p>{" "}
                  <div className="rounded-xl bg-slate-50 p-3">
                    {" "}
                    <p className="font-semibold text-slate-900">
                      {" "}
                      {summaryDealer?.name || "No dealer selected"}{" "}
                    </p>{" "}
                    {summaryDealer?.phone && (
                      <p className="mt-1 text-xs text-slate-500">
                        {summaryDealer.phone}
                      </p>
                    )}{" "}
                  </div>{" "}
                </div>
                {/* Stats */}{" "}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {" "}
                  <div className="rounded-xl bg-slate-50 p-4">
                    {" "}
                    <p className="text-xs text-slate-400">
                      Product Lines{" "}
                    </p>{" "}
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {totalProductLines}{" "}
                    </p>{" "}
                  </div>{" "}
                  <div className="rounded-xl bg-slate-50 p-4">
                    {" "}
                    <p className="text-xs text-slate-400">Total Qty </p>{" "}
                    <p className="mt-1 text-2xl font-bold text-[#B5220E]">
                      {totalQuantity}{" "}
                    </p>{" "}
                  </div>{" "}
                </div>
                {/* Products summary */}{" "}
                <div>
                  {" "}
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Products{" "}
                  </p>{" "}
                  <div className="space-y-3">
                    {" "}
                    {products.map((product, index) => {
                      const productData = catalogProducts.find(
                        (p) => String(p.id) === String(product.productId),
                      );

                      const quantity = product.shades.reduce(
                        (shadeTotal, shade) =>
                          shadeTotal +
                          shade.packs.reduce(
                            (packTotal, pack) =>
                              packTotal + Number(pack.quantity || 0),

                            0,
                          ),

                        0,
                      );

                      return (
                        <div
                          key={product.id}
                          className="border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                        >
                          {" "}
                          <div className="flex items-start justify-between gap-3">
                            {" "}
                            <div>
                              {" "}
                              <p className="text-sm font-semibold text-slate-800">
                                {index + 1}.{" "}
                                {productData?.name ||
                                  "Product not selected"}{" "}
                              </p>{" "}
                              <p className="mt-1 text-xs text-slate-500">
                                {" "}
                                {product.shades.length} shade{" "}
                                {product.shades.length !== 1 ? "s" : ""}{" "}
                              </p>{" "}
                            </div>{" "}
                            <span className="rounded-full bg-[#B5220E]/10 px-2 py-1 text-xs font-bold text-[#B5220E]">
                              {quantity}{" "}
                            </span>{" "}
                          </div>{" "}
                        </div>
                      );
                    })}{" "}
                  </div>{" "}
                </div>
                {/* Delivery */}{" "}
                <div className="rounded-xl border border-slate-100 p-3">
                  {" "}
                  <p className="text-xs text-slate-400">Delivery </p>{" "}
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {" "}
                    {deliveryType === "direct"
                      ? "Direct Delivery"
                      : "Transport Delivery"}{" "}
                  </p>{" "}
                  {deliveryType === "transport" && selectedTransport && (
                    <p className="mt-1 text-xs text-slate-500">
                      {" "}
                      {
                        TRANSPORTS.find(
                          (t) => String(t.id) === String(selectedTransport),
                        )?.name
                      }{" "}
                    </p>
                  )}{" "}
                </div>
                {/* Submit */}{" "}
                {submitError && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>}
                  <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B5220E] px-5 py-3.5 font-bold text-white shadow-lg shadow-[#B5220E]/20 transition hover:bg-[#941b0b] active:scale-[0.99]"
                >
                  <CheckCircle2 size={18} />
                  Place Order{" "}
                </button>{" "}
                <button
                  type="button"
                  onClick={() => navigate(dashboardPath)}
                  className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel{" "}
                </button>{" "}
                <p className="text-center text-xs leading-5 text-slate-400">
                  Order place hone ke baad backend phase mein WhatsApp
                  notifications automatically trigger karenge.{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </aside>{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}

/* =========================================================

   Small Component

\========================================================= */

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400"> {icon} </div>{" "}
      <div>
        {" "}
        <p className="text-xs text-slate-400"> {label} </p>{" "}
        <p className="mt-0.5 text-sm font-medium text-slate-700">
          {value || "—"}{" "}
        </p>{" "}
      </div>{" "}
    </div>
  );
}
