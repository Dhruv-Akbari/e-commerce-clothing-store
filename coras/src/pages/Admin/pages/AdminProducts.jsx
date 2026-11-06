import { useEffect, useRef, useState } from "react";
import AdminNavbar from "../Adminnavbar";
import {
  GetAllProducts,
  AddProduct,
  UpdateProduct,
  DeleteProduct,
} from "../../../api/api";

const emptyProduct = {
  name: "",
  detail: "",
  description: "",
  category: "Shirts",
  gender: "Men",
  price: "",
  originalPrice: "",
  currency: "INR",
  sizes: ["S", "M", "L", "XL"],
  colors: ["White"],
  material: "",
  fit: "Regular Fit",
  sleeve: "Long Sleeve",
  rating: 0,
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  images: [],
  image: "",
  createdAt: new Date().toISOString().slice(0, 10),
};

const categories = [
  "Shirts",
  "T-Shirts",
  "Trousers",
  "Jeans",
  "Outerwear",
  "Tops",
  "Knitwear",
];

const sizesList = ["XS", "S", "M", "L", "XL", "XXL"];
const jeansSizesList = ["28", "30", "32", "34", "36", "38", "40", "42"];
const colorsList = [
  "White",
  "Black",
  "Light Blue",
  "Navy",
  "Beige",
  "Brown",
  "Grey",
  "Green",
  "Pink",
];

const inputStyle =
  "w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3.5 text-sm outline-none transition focus:border-black/50 focus:bg-white";

const labelStyle =
  "mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-500";

const formatPrice = (price, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(price) || 0);
};

const AdminProduct = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(emptyProduct);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setVisibleCount(8);
  }, [search, categoryFilter]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await GetAllProducts();

        // if API dont return anything
        const productList = Array.isArray(response)
          ? response
          : response?.products || response?.data || [];

        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
        setNotice("Products load nahi ho paaye.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timeout);
  }, [notice]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = [
      product.name,
      product.category,
      product.gender,
      product.material,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const updateField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const toggleArrayValue = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: previous[key].includes(value)
        ? previous[key].filter((item) => item !== value)
        : [...previous[key], value],
    }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...emptyProduct,
      createdAt: new Date().toISOString().slice(0, 10),
      sizes: ["S", "M", "L", "XL"],
      colors: ["White"],
    });
    setExistingImages([]);
    setImageFiles([]);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id ?? product.id);

    const productImages = Array.isArray(product.Images)
      ? product.Images.map((item) =>
          typeof item === "string" ? item : item?.url,
        ).filter(Boolean)
      : Array.isArray(product.images)
        ? product.images
            .map((item) => (typeof item === "string" ? item : item?.url))
            .filter(Boolean)
        : product.image
          ? [product.image]
          : [];

    setForm({
      ...emptyProduct,
      ...product,
      sizes: Array.isArray(product.sizes) ? [...product.sizes] : [],
      colors: Array.isArray(product.colors) ? [...product.colors] : [],
      images: [],
      image: productImages[0] || product.image || "",
    });
    setExistingImages(productImages);
    setImageFiles([]);
    setModalOpen(true);
  };

  const processFiles = (fileList) => {
    const files = Array.from(fileList || []);
    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024,
    );

    if (validFiles.length !== files.length) {
      setNotice("Only images up to 5 MB each are accepted.");
    }

    if (!validFiles.length) return;

    setImageFiles((previous) => {
      const combined = [...previous, ...validFiles];
      const unique = combined.filter(
        (file, index, all) =>
          all.findIndex(
            (item) =>
              item.name === file.name &&
              item.size === file.size &&
              item.lastModified === file.lastModified,
          ) === index,
      );
      return unique.slice(0, 8 - existingImages.length);
    });
  };

  const removeExistingImage = (index) => {
    setExistingImages((previous) => previous.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setImageFiles((previous) => previous.filter((_, i) => i !== index));
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;

    try {
      const response = await DeleteProduct(deleteId);

      // Refresh products after successful deletion
      const result = await GetAllProducts();

      const productList = Array.isArray(result)
        ? result
        : result?.products || result?.data || [];

      setProducts(productList);
      setDeleteId(null);

      setNotice(response?.message || "Product deleted successfully.");
    } catch (error) {
      console.error("Error deleting product:", error);

      setNotice(
        error?.response?.data?.message ||
          error?.message ||
          "Product could not be deleted.",
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!form.name.trim()) {
      setNotice("Please enter a product name.");
      return;
    }

    if (!form.category) {
      setNotice("Please select a category.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setNotice("Please enter a valid selling price.");
      return;
    }

    if (form.originalPrice !== "" && Number(form.originalPrice) < 0) {
      setNotice("Original price cannot be negative.");
      return;
    }

    if (existingImages.length + imageFiles.length === 0) {
      setNotice("Please select at least one product image.");
      return;
    }

    try {
      setSaving(true);

      const productData = new FormData();

      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice:
          form.originalPrice === "" ? "" : Number(form.originalPrice),
        rating: Number(form.rating) || 0,
        images: undefined,
        image: existingImages[0] || form.image || "",
      };

      Object.entries(payload).forEach(([key, value]) => {
        if (key === "images" || value === undefined || value === null) return;

        if (Array.isArray(value)) {
          productData.append(key, JSON.stringify(value));
        } else {
          productData.append(key, String(value));
        }
      });

      imageFiles.forEach((file) => {
        productData.append("images", file);
      });

      productData.append("existingImages", JSON.stringify(existingImages));

      const response =
        editingId !== null
          ? await UpdateProduct(editingId, productData)
          : await AddProduct(productData);

      const result = await GetAllProducts();

      const productList = Array.isArray(result)
        ? result
        : result?.products || result?.data || [];

      setProducts(productList);

      setModalOpen(false);
      setImageFiles([]);
      setExistingImages([]);

      setNotice(
        response?.message ||
          (editingId !== null
            ? "Product updated successfully!"
            : "Product added successfully!"),
      );
    } catch (error) {
      console.error("Error saving product:", error);

      setNotice(
        error?.response?.data?.message ||
          error?.message ||
          "Product could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50  text-[#171717]">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-10 md:px-10">
        {/* Page introduction */}
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/50 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl md:p-12">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#d8c3a5]/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[#c9d8d1]/50 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="mb-5 inline-block rounded-full border border-white bg-white/60 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-gray-600">
                Administration · Products
              </span>

              <h1 className="text-4xl font-light leading-tight tracking-tight md:text-6xl">
                Your product
                <span className="block font-medium italic">collection.</span>
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-relaxed text-gray-600 md:text-base">
                Curate your catalog, manage product details, and bring every
                piece of your collection to life.
              </p>

              <button
                onClick={openCreateModal}
                className="mt-8 rounded-full bg-black px-7 py-4 text-sm text-white transition hover:bg-gray-800"
              >
                + Add a product <span className="ml-2">↗</span>
              </button>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total products",
              value: products.length,
              icon: "◇",
            },
            {
              label: "Featured items",
              value: products.filter((p) => p.isFeatured).length,
              icon: "✳",
            },
            {
              label: "Categories",
              value: new Set(products.map((p) => p.category)).size,
              icon: "⌘",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.5rem] border border-white/80 bg-white/60 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] backdrop-blur-xl transition hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f0] text-lg">
                  {stat.icon}
                </span>
              </div>
              <h2 className="mt-5 text-3xl font-medium tracking-tight">
                {stat.value}
              </h2>
            </div>
          ))}
        </section>

        {/* Product toolbar */}
        <section className="mt-14">
          <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Your inventory
              </p>
              <h2 className="mt-3 text-3xl font-light md:text-4xl">
                All <span className="italic">products.</span>
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""} displayed
              </p>
            </div>
          </div>

          <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                ⌕
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products, categories, materials..."
                className="w-full rounded-full border border-white/80 bg-white/60 py-4 pl-11 pr-5 text-sm outline-none transition focus:border-black/20 focus:bg-white"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-full border border-white/80 bg-white/60 px-5 py-4 text-sm outline-none focus:border-black/20"
            >
              <option value="All">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Responsive product cards */}
          {filteredProducts.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product) => (
                <article
                  key={product._id ?? product.id}
                  className="group overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.03)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/4.5] overflow-hidden bg-[#eeece6]">
                    {product.Images?.[0]?.url ? (
                      <img
                        src={product.Images[0].url}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        No image available
                      </div>
                    )}

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {product.isFeatured && (
                        <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] uppercase tracking-wider backdrop-blur">
                          Featured
                        </span>
                      )}
                      {product.isNewArrival && (
                        <span className="rounded-full bg-black/85 px-3 py-1.5 text-[10px] uppercase tracking-wider text-white">
                          New arrival
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => openEditModal(product)}
                      aria-label={`Edit ${product.name}`}
                      className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg shadow-lg transition hover:bg-black hover:text-white"
                    >
                      ↗
                    </button>
                  </div>

                  <div className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                          {product.category} · {product.gender}
                        </p>
                        <h3 className="mt-2 truncate text-xl font-medium">
                          {product.name}
                        </h3>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-medium">
                          {formatPrice(product.price, product.currency)}
                        </p>
                        {product.originalPrice > product.price && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatPrice(
                              product.originalPrice,
                              product.currency,
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-500">
                      {product.detail}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>★</span>
                        <span>{Number(product.rating || 0).toFixed(1)}</span>
                        <span>·</span>
                        <span>{(product.sizes || []).length} sizes</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded-full border border-black/10 px-4 py-2 text-xs transition hover:bg-black hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(product.id ?? product._id)}
                          className="rounded-full border border-red-100 px-4 py-2 text-xs text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {visibleCount < filteredProducts.length && (
                <div className="mt-12 flex flex-col items-center">
                  <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gray-400">
                    Showing {visibleProducts.length} of{" "}
                    {filteredProducts.length} products
                  </p>

                  <button
                    onClick={() =>
                      setVisibleCount((previous) =>
                        Math.min(previous + 8, filteredProducts.length),
                      )
                    }
                    className="group flex items-center gap-3 rounded-full border border-black/10 bg-white/60 px-8 py-4 text-sm transition duration-300 hover:border-black hover:bg-black hover:text-white"
                  >
                    Load more products
                    <span className="transition-transform duration-300 group-hover:translate-y-1">
                      ↓
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-white/80 bg-white/50 px-6 py-20 text-center">
              <div className="text-4xl">◇</div>
              <h3 className="mt-4 text-2xl font-light">Nothing here yet.</h3>
              <p className="mt-2 text-sm text-gray-500">
                Try another search or create a new product.
              </p>
              <button
                onClick={openCreateModal}
                className="mt-6 rounded-full bg-black px-6 py-3 text-sm text-white hover:bg-gray-800"
              >
                Create product
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Create / edit product modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-5 backdrop-blur-sm sm:px-6 sm:py-10"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/80 bg-[#f8f7f2] shadow-2xl"
          >
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 bg-[#f8f7f2]/95 px-5 py-5 backdrop-blur-xl sm:px-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
                  Product management
                </p>
                <h2 className="mt-1 text-2xl font-light sm:text-3xl">
                  {editingId !== null ? "Edit product" : "New product"}
                  <span className="italic">.</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-xl hover:bg-black hover:text-white"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="space-y-8 p-5 sm:p-8">
              {/* Image upload */}
              <section>
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    01 — Product imagery
                  </p>
                  <h3 className="mt-2 text-xl font-medium">Make it visual.</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Drag images here or browse your device. Up to 8 images,
                    maximum 5 MB each.
                  </p>
                </div>

                <div
                  onDragEnter={(event) => {
                    event.preventDefault();
                    dragCounter.current += 1;
                    setDragging(true);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    dragCounter.current -= 1;
                    if (dragCounter.current <= 0) {
                      dragCounter.current = 0;
                      setDragging(false);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    dragCounter.current = 0;
                    setDragging(false);
                    processFiles(event.dataTransfer.files);
                  }}
                  className={`rounded-[1.5rem] border-2 border-dashed p-5 transition sm:p-7 ${
                    dragging
                      ? "border-black bg-[#e9e5dc]"
                      : "border-black/15 bg-white/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      processFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />

                  <div className="mb-5 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                      ↑
                    </div>
                    <p className="mt-3 text-sm font-medium">
                      Drop your product images here
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      JPG, PNG, WebP and other browser-supported images
                    </p>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={existingImages.length + imageFiles.length >= 8}
                      className="mt-4 rounded-full bg-black px-5 py-3 text-xs text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Browse files
                    </button>
                  </div>

                  {(existingImages.length > 0 || imageFiles.length > 0) && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {existingImages.map((src, index) => (
                        <div
                          key={`existing-${index}`}
                          className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white"
                        >
                          <img
                            src={src}
                            alt={`Product preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          {index === 0 && (
                            <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[9px] uppercase tracking-wider">
                              Main image
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow"
                            aria-label="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      {imageFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${file.lastModified}-${index}`}
                          className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute bottom-2 left-2 right-2 truncate rounded-full bg-white/90 px-2 py-1 text-[9px]">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow"
                            aria-label="Remove uploaded image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Basic details */}
              <section>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  02 — Product details
                </p>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className={labelStyle}>Product name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="e.g. Relaxed Oxford Shirt"
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Category *</label>
                    <select
                      required
                      value={form.category}
                      onChange={(e) => {
                        const category = e.target.value;

                        setForm((previous) => ({
                          ...previous,
                          category,
                          sizes: [],
                        }));
                      }}
                      className={inputStyle}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelStyle}>Gender</label>
                    <select
                      value={form.gender}
                      onChange={(e) => updateField("gender", e.target.value)}
                      className={inputStyle}
                    >
                      {["Men", "Women", "Unisex", "Kids"].map((gender) => (
                        <option key={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelStyle}>Full description</label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      className={inputStyle}
                      placeholder="Describe the product in detail..."
                    />
                  </div>
                </div>
              </section>

              {/* Pricing */}
              <section>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  03 — Pricing
                </p>

                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div>
                    <label className={labelStyle}>Selling price *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => updateField("price", e.target.value)}
                      className={inputStyle}
                      placeholder="95.00"
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Original price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.originalPrice ?? ""}
                      onChange={(e) =>
                        updateField("originalPrice", e.target.value)
                      }
                      className={inputStyle}
                      placeholder="120.00"
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Currency</label>
                    <select
                      value={form.currency}
                      onChange={(e) => updateField("currency", e.target.value)}
                      className={inputStyle}
                    >
                      {["INR"].map((currency) => (
                        <option key={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelStyle}>Rating</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={form.rating}
                      onChange={(e) => updateField("rating", e.target.value)}
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Created date</label>
                    <input
                      type="date"
                      value={form.createdAt}
                      onChange={(e) => updateField("createdAt", e.target.value)}
                      className={inputStyle}
                    />
                  </div>
                </div>
              </section>

              {/* Attributes */}
              <section>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  04 — Fit & details
                </p>

                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelStyle}>Material</label>
                    <input
                      value={form.material}
                      onChange={(e) => updateField("material", e.target.value)}
                      placeholder="100% Cotton"
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Fit</label>
                    <select
                      value={form.fit}
                      onChange={(e) => updateField("fit", e.target.value)}
                      className={inputStyle}
                    >
                      {[
                        "Slim Fit",
                        "Regular Fit",
                        "Relaxed Fit",
                        "Oversized Fit",
                        "Straight Fit",
                      ].map((fit) => (
                        <option key={fit}>{fit}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelStyle}>Sleeve</label>
                    <select
                      value={form.sleeve}
                      onChange={(e) => updateField("sleeve", e.target.value)}
                      className={inputStyle}
                    >
                      {[
                        "Long Sleeve",
                        "Short Sleeve",
                        "Sleeveless",
                        "Three-quarter Sleeve",
                      ].map((sleeve) => (
                        <option key={sleeve}>{sleeve}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className={labelStyle}>Available sizes</label>

                  <div className="flex flex-wrap gap-2">
                    {(form.category === "Jeans" || form.category === "Trousers"
                      ? jeansSizesList
                      : sizesList
                    ).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleArrayValue("sizes", size)}
                        className={`flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm transition ${
                          form.sizes.includes(size)
                            ? "border-black bg-black text-white"
                            : "border-black/10 bg-white/70 hover:border-black/40"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <label className={labelStyle}>Available colors</label>
                  <div className="flex flex-wrap gap-2">
                    {colorsList.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleArrayValue("colors", color)}
                        className={`rounded-full border px-4 py-2.5 text-xs transition ${
                          form.colors.includes(color)
                            ? "border-black bg-black text-white"
                            : "border-black/10 bg-white/70 hover:border-black/40"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Product flags */}
              <section>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  05 — Collection visibility
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    ["isFeatured", "Featured product"],
                    ["isNewArrival", "New arrival"],
                    ["isBestSeller", "Best seller"],
                  ].map(([key, label]) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white bg-white/60 p-4 transition hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(form[key])}
                        onChange={(e) => updateField(key, e.target.checked)}
                        className="h-4 w-4 accent-black"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 flex flex-col-reverse justify-between gap-3 border-t border-black/5 bg-[#f8f7f2]/95 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:px-8">
              <p className="text-xs text-gray-400">* Required fields</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-full border border-black/10 px-5 py-3 text-sm transition hover:bg-white sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-full bg-black px-6 py-3 text-sm text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                      {editingId !== null ? "Updating..." : "Adding product..."}
                    </span>
                  ) : (
                    <>
                      {editingId !== null ? "Save changes" : "Create product"} →
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.75rem] border border-white bg-[#f8f7f2] p-7 shadow-2xl sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">
              ×
            </span>
            <h2 className="mt-5 text-2xl font-light">
              Delete this <span className="italic">product?</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              This removes the product from your local catalog. This action
              cannot be undone.
            </p>
            <div className="mt-7 flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-full border border-black/10 px-4 py-3 text-sm hover:bg-white"
              >
                Keep product
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-full bg-black px-4 py-3 text-sm text-white hover:bg-red-700"
              >
                Delete product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {notice && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[70] w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-black px-5 py-3 text-center text-sm text-white shadow-xl"
        >
          {notice}
        </div>
      )}
    </div>
  );
};
export default AdminProduct;
