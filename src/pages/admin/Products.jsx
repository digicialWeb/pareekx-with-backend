import { useEffect, useMemo, useState } from "react";
import { createRecord, patchRecord, removeRecord, watchCollection, saveRecord } from "../../services/firebaseData";
import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Palette,
  Boxes,
} from "lucide-react";

const EMPTY_FORM = {
  name: "",
  code: "",
  category: "Interior",
  unit: "Litre",
  active: true,
};

function createShade() {
  return {
    id: Date.now() + Math.random(),
    name: "",
    code: "",
  };
}

function ProductStatus({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      <CheckCircle2 size={14} />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
      <XCircle size={14} />
      Inactive
    </span>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    return watchCollection("products", (items) => {
      setProducts(items);
      setLoadingProducts(false);
      setDataError("");
    }, (error) => {
      console.error("Failed to load products from Firestore", error);
      setDataError("Products could not be loaded. Check your Firebase login and Firestore rules.");
      setLoadingProducts(false);
    });
  }, []);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [shades, setShades] = useState([]);
  const [packSizes, setPackSizes] = useState(["1 L", "4 L", "10 L", "20 L"]);

  const [newPackSize, setNewPackSize] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))],
    [products]
  );

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((product) => product.active).length,
      inactive: products.filter((product) => !product.active).length,
      shades: products.reduce(
        (total, product) => total + (product.shades || []).length,
        0
      ),
    }),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.code.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.shades || []).some((shade) =>
          shade.name.toLowerCase().includes(query)
        );

      const matchesCategory =
        categoryFilter === "ALL" || product.category === categoryFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && product.active) ||
        (statusFilter === "INACTIVE" && !product.active);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setShades([createShade()]);
    setPackSizes(["1 L", "4 L", "10 L", "20 L"]);
    setNewPackSize("");
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      code: product.code,
      category: product.category,
      unit: product.unit,
      active: product.active,
    });
    setShades((product.shades || []).map((shade) => ({ ...shade })));
    setPackSizes([...(product.packSizes || [])]);
    setNewPackSize("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const addShade = () => {
    setShades((current) => [...current, createShade()]);
  };

  const updateShade = (id, field, value) => {
    setShades((current) =>
      current.map((shade) =>
        shade.id === id ? { ...shade, [field]: value } : shade
      )
    );
  };

  const removeShade = (id) => {
    setShades((current) => current.filter((shade) => shade.id !== id));
  };

  const addPackSize = () => {
    const value = newPackSize.trim();
    if (!value) return;

    const exists = packSizes.some(
      (pack) => pack.toLowerCase() === value.toLowerCase()
    );

    if (!exists) {
      setPackSizes((current) => [...current, value]);
    }

    setNewPackSize("");
  };

  const removePackSize = (value) => {
    setPackSizes((current) => current.filter((pack) => pack !== value));
  };

  const saveProduct = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter product name.");
      return;
    }

    if (!form.code.trim()) {
      alert("Please enter product code.");
      return;
    }

    const validShades = shades
      .filter((shade) => shade.name.trim())
      .map((shade) => ({
        ...shade,
        name: shade.name.trim(),
        code: shade.code.trim(),
      }));

    if (validShades.length === 0) {
      alert("Please add at least one shade.");
      return;
    }

    if (packSizes.length === 0) {
      alert("Please add at least one pack size.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      category: form.category,
      unit: form.unit,
      active: form.active,
      shades: validShades,
      packSizes,
    };

    try {
      if (editingProduct) await saveRecord("products", editingProduct.id, productData);
      else await createRecord("products", productData);
      closeModal();
    } catch (error) {
      console.error(error);
      alert("Product could not be saved to Firebase. Check account permissions and Firestore rules.");
    }
  };

  const toggleProductStatus = async (productId) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    try { await patchRecord("products", productId, { active: !product.active }); }
    catch (error) { console.error(error); alert("Could not update product status in Firebase."); }
  };

  const deleteProduct = async (productId) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    const confirmed = window.confirm(`Delete "${product.name}" permanently from the shared database?`);

    if (!confirmed) return;

    try {
      await removeRecord("products", productId);
      if (selectedProduct?.id === productId) setSelectedProduct(null);
    } catch (error) {
      console.error(error);
      alert("Could not delete product from Firebase.");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {loadingProducts && <div className="mb-4 rounded-xl bg-white p-4 text-sm text-gray-600">Loading products from Firebase…</div>}
        {dataError && <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{dataError}</div>}
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#B5220E]">
              Pareek Admin
            </p>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Products Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage products, shades and pack sizes used in orders.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B5220E] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#981d0c]"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Total Products", stats.total, Package, "text-gray-900"],
            ["Active Products", stats.active, CheckCircle2, "text-emerald-600"],
            ["Inactive", stats.inactive, XCircle, "text-gray-500"],
            ["Total Shades", stats.shades, Palette, "text-[#B5220E]"],
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
                placeholder="Search product, code, category or shade..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#B5220E] focus:bg-white focus:ring-2 focus:ring-[#B5220E]/10"
              />
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm font-medium outline-none focus:border-[#B5220E] md:w-48"
              >
                <option value="ALL">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm font-medium outline-none focus:border-[#B5220E] md:w-44"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            <button
              onClick={resetFilters}
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Products table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-bold text-gray-900">Product Catalogue</h2>
            <p className="text-xs text-gray-500">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-4 font-semibold">Product</th>
                  <th className="px-5 py-4 font-semibold">Category</th>
                  <th className="px-5 py-4 font-semibold">Unit</th>
                  <th className="px-5 py-4 font-semibold">Shades</th>
                  <th className="px-5 py-4 font-semibold">Pack Sizes</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="transition hover:bg-gray-50/70">
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">{product.name}</p>
                      <p className="mt-1 text-xs font-medium text-gray-400">
                        {product.code}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {product.category}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {product.unit}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex max-w-[280px] flex-wrap gap-1.5">
                        {(product.shades || []).slice(0, 3).map((shade) => (
                          <span
                            key={shade.id}
                            className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600"
                          >
                            {shade.name}
                          </span>
                        ))}
                        {(product.shades || []).length > 3 && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                            +{(product.shades || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex max-w-[220px] flex-wrap gap-1.5">
                        {(product.packSizes || []).map((pack) => (
                          <span
                            key={pack}
                            className="rounded-lg bg-[#B5220E]/5 px-2.5 py-1 text-xs font-semibold text-[#B5220E]"
                          >
                            {pack}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <ProductStatus active={product.active} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          View
                        </button>

                        <button
                          onClick={() => openEditModal(product)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          onClick={() => toggleProductStatus(product.id)}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                            product.active
                              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {product.active ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          onClick={() => deleteProduct(product.id)}
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

          {filteredProducts.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Package className="mx-auto text-gray-300" size={42} />
              <h3 className="mt-3 font-bold text-gray-800">
                No products found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 p-5 md:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#B5220E]">
                  Product Catalogue
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={21} />
              </button>
            </div>

            <form
              onSubmit={saveProduct}
              className="max-h-[calc(94vh-95px)] overflow-y-auto p-5 md:p-6"
            >
              {/* Basic details */}
              <div className="rounded-2xl border border-gray-100 p-5">
                <h3 className="mb-4 font-bold text-gray-900">
                  Basic Details
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Product Name"
                    required
                    value={form.name}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, name: value }))
                    }
                    placeholder="e.g. Premium Interior Paint"
                  />

                  <Field
                    label="Product Code"
                    required
                    value={form.code}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, code: value }))
                    }
                    placeholder="e.g. PIP-001"
                  />

                  <SelectField
                    label="Category"
                    value={form.category}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, category: value }))
                    }
                    options={["Interior", "Exterior", "Primer", "Putty", "Other"]}
                  />

                  <SelectField
                    label="Unit"
                    value={form.unit}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, unit: value }))
                    }
                    options={["Litre", "Kg", "Piece", "Box"]}
                  />
                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        active: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-[#B5220E]"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Product is active and available for orders
                  </span>
                </label>
              </div>

              {/* Shades */}
              <div className="mt-5 rounded-2xl border border-gray-100 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900">Shades</h3>
                    <p className="text-xs text-gray-500">
                      Add all shades available for this product.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addShade}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#B5220E]/5 px-3 py-2 text-xs font-bold text-[#B5220E] hover:bg-[#B5220E]/10"
                  >
                    <Plus size={15} />
                    Add Shade
                  </button>
                </div>

                <div className="space-y-3">
                  {shades.map((shade, index) => (
                    <div
                      key={shade.id}
                      className="grid gap-3 rounded-xl bg-gray-50 p-3 md:grid-cols-[1fr_180px_auto]"
                    >
                      <input
                        value={shade.name}
                        onChange={(event) =>
                          updateShade(shade.id, "name", event.target.value)
                        }
                        placeholder={`Shade ${index + 1} name`}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#B5220E]"
                      />

                      <input
                        value={shade.code}
                        onChange={(event) =>
                          updateShade(shade.id, "code", event.target.value)
                        }
                        placeholder="Shade code"
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#B5220E]"
                      />

                      <button
                        type="button"
                        onClick={() => removeShade(shade.id)}
                        className="rounded-lg border border-red-100 bg-white px-3 py-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pack sizes */}
              <div className="mt-5 rounded-2xl border border-gray-100 p-5">
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900">Pack Sizes</h3>
                  <p className="text-xs text-gray-500">
                    These options will appear while creating an order.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {packSizes.map((pack) => (
                    <span
                      key={pack}
                      className="inline-flex items-center gap-2 rounded-full bg-[#B5220E]/5 px-3 py-2 text-xs font-bold text-[#B5220E]"
                    >
                      <Boxes size={14} />
                      {pack}
                      <button
                        type="button"
                        onClick={() => removePackSize(pack)}
                        className="rounded-full hover:bg-[#B5220E]/10"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    value={newPackSize}
                    onChange={(event) => setNewPackSize(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addPackSize();
                      }
                    }}
                    placeholder="e.g. 5 L"
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#B5220E] focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={addPackSize}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Footer */}
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
                  {editingProduct ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#B5220E]">
                  Product Details
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {selectedProduct.name}
                </h2>
                <p className="text-sm text-gray-400">
                  {selectedProduct.code}
                </p>
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-4">
                <DetailCard label="Category" value={selectedProduct.category} />
                <DetailCard label="Unit" value={selectedProduct.unit} />
                <DetailCard
                  label="Shades"
                  value={selectedProduct.shades.length}
                />
                <DetailCard
                  label="Pack Sizes"
                  value={selectedProduct.packSizes.length}
                />
              </div>

              <div className="rounded-2xl border border-gray-100 p-5">
                <h3 className="mb-3 font-bold text-gray-900">Available Shades</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selectedProduct.shades.map((shade) => (
                    <div
                      key={shade.id}
                      className="rounded-xl bg-gray-50 p-3"
                    >
                      <p className="font-semibold text-gray-800">
                        {shade.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {shade.code || "No code"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-5">
                <h3 className="mb-3 font-bold text-gray-900">
                  Available Pack Sizes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.packSizes.map((pack) => (
                    <span
                      key={pack}
                      className="rounded-full bg-[#B5220E]/5 px-3 py-2 text-xs font-bold text-[#B5220E]"
                    >
                      {pack}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
                <div>
                  <p className="font-bold text-gray-800">Product Status</p>
                  <p className="text-xs text-gray-500">
                    Controls whether the product can be used for new orders.
                  </p>
                </div>
                <ProductStatus active={selectedProduct.active} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, required, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-[#B5220E]">*</span>}
      </span>
      <input
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
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#B5220E] focus:bg-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
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
