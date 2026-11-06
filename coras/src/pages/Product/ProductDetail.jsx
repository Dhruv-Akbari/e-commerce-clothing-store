import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/navbar";
import Cart from "../../components/cart/cart";
import useCart from "../../context/CartContext";
import { GetAllProducts } from "../../api/api";

const normalizeArray = (value) => {
  if (!value) return [];

  // Convert arrays containing comma-separated or JSON strings
  const items = Array.isArray(value) ? value : [value];

  return items.flatMap((item) => {
    if (typeof item !== "string") return [item];

    const trimmed = item.trim();
    if (!trimmed) return [];

    // Handle strings such as '["Black","Light Blue"]'
    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed.flatMap((entry) =>
          String(entry)
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        );
      }
    } catch {
      // Use comma-separated parsing below
    }

    return trimmed
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  });
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showNotFound, setShowNotFound] = useState(false);
  const [allProducts, setallProducts] = useState([]);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [id]);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const response = await GetAllProducts();

        const products = response.data || [];

        setallProducts(
          products.map((product) => ({
            ...product,
            sizes: normalizeArray(product.sizes),
            colors: normalizeArray(product.colors),
          })),
        );
      } catch (error) {
        console.log(error);
      }
    };
    fetchdata();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotFound(true);
    }, 10000); // 10,000 ms = 10 seconds

    return () => clearTimeout(timer); 
  }, []);

  const {
    isCartOpen,
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
    openCart,
    closeCart,
  } = useCart();

  const product = allProducts.find((item) => item._id === id);
  const productImages = (product?.Images || [])
    .map((image) => (typeof image === "string" ? image : image?.url))
    .filter(Boolean);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const cartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) {
      alert("Please select a size first.");
      return;
    }

    if (product.colors?.length && !selectedColor) {
      alert("Please select a color first.");
      return;
    }

    // CORRECT: Pass the full product object, size, and color as separate arguments
    addToCart(product, selectedSize, selectedColor);

    setAdded(true);
    openCart();
  };
  if (product) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] text-[#171717]">
        <Navbar onCartClick={openCart} cartCount={cartCount} />

        <Cart
          isOpen={isCartOpen}
          onClose={closeCart}
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
        />

        <main className="px-5 md:px-10 lg:px-16 py-8 mt-5">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-8">
            <button className="hover:text-black transition"></button>
            <span> </span>
            <span> </span>
            <span> </span>
            <span className="text-[#171717]"></span>
          </div>

          {/* Product Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
           

            {/* PRODUCT IMAGE CAROUSEL */}
            <div className="rounded-[2rem] bg-white/50 backdrop-blur-xl border border-white/70 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
              {/* MAIN IMAGE SLIDER */}
              <div className="relative mx-auto w-full max-w-[480px] overflow-hidden rounded-[1.5rem] bg-[#e9e7e0] aspect-[4/5]">
                {productImages.length > 0 ? (
                  <Swiper
                    modules={[Navigation, Pagination, Thumbs]}
                    navigation
                    pagination={{ clickable: true }}
                    thumbs={{
                      swiper:
                        thumbsSwiper && !thumbsSwiper.destroyed
                          ? thumbsSwiper
                          : null,
                    }}
                    loop={productImages.length > 1}
                    className="product-detail-swiper h-full w-full"
                  >
                    {productImages.map((image, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No product image available
                  </div>
                )}

                {/* NEW ARRIVAL BADGE */}
                {product.isNewArrival && (
                  <span className="pointer-events-none absolute left-5 top-5 z-10 rounded-full border border-white bg-white/80 px-4 py-2 text-[10px] uppercase tracking-[0.2em] backdrop-blur-md">
                    New Arrival
                  </span>
                )}
              </div>

              {/* THUMBNAIL SLIDER */}
              {productImages.length > 1 && (
                <Swiper
                  onSwiper={setThumbsSwiper}
                  modules={[Thumbs]}
                  spaceBetween={12}
                  slidesPerView={8}
                  watchSlidesProgress
                  className="product-thumbs mx-auto mt-4 max-w-[480px]"
                >
                  {productImages.map((image, index) => (
                    <SwiperSlide key={index}>
                      <div className="aspect-[4/5] cursor-pointer overflow-hidden rounded-xl border-2 border-transparent transition-all duration-200">
                        <img
                          src={image}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>

            {/* Product Information */}
            <div className="lg:sticky lg:top-24 py-3 md:py-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                {product.gender} / {product.category}
              </p>

              <h1 className="text-4xl md:text-5xl xl:text-6xl font-light tracking-tight leading-tight mt-5">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-5">
                <span className="text-2xl font-medium">₹{product.price}</span>

                {product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-gray-600">
                      Save ₹{product.originalPrice - product.price}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 mt-5 text-sm">
                <span className="text-amber-600">★</span>
                <span>{product.rating}/5</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">Premium quality</span>
              </div>

              <div className="h-px bg-black/10 my-7" />

              <p className="text-gray-600 leading-8">
                {product.description || product.detail}
              </p>

              {/* Size Selection */}
              {product.sizes?.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium">Select Size</h2>
                    <span className="text-xs text-gray-400">Required</span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {product.sizes?.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-12 h-12 px-4 rounded-full border transition ${
                          selectedSize === size
                            ? "bg-black text-white border-black"
                            : "bg-white/50 border-white hover:border-black"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors?.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-sm font-medium mb-4">
                    Color
                    {selectedColor && (
                      <span className="text-gray-500 font-normal">
                        {" "}
                        — {selectedColor}
                      </span>
                    )}
                  </h2>

                  <div className="flex flex-wrap gap-3">
                    {product.colors?.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        aria-pressed={selectedColor === color}
                        className={`px-4 py-2.5 rounded-full border text-sm transition ${
                          selectedColor === color
                            ? "border-black bg-black text-white"
                            : "border-white bg-white/50 hover:border-black"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-8">
                <h2 className="text-sm font-medium mb-4">Quantity</h2>

                <div className="inline-flex items-center gap-5 rounded-full border border-white bg-white/50 px-4 py-2">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-xl disabled:opacity-30"
                  >
                    −
                  </button>

                  <span className="min-w-4 text-center">{quantity}</span>

                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="text-xl"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full mt-8 py-4 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition shadow-lg"
              >
                {added ? "Add Another to Cart" : "Add to Cart"} — ₹
                {(product.price * quantity).toFixed(2)}
              </button>

              <p className="mt-4 text-center text-xs text-gray-500">
                Timeless style. Everyday comfort.
              </p>

              {/* Product Details */}
              <div className="mt-8 rounded-[1.5rem] bg-white/50 backdrop-blur-xl border border-white/70 p-6">
                <h2 className="text-lg font-medium mb-5">Product Details</h2>

                <div className="space-y-4 text-sm">
                  {[
                    ["Material", product.material],
                    ["Fit", product.fit],
                    ["Sleeve", product.sleeve],
                    ["Category", product.category],
                  ]
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div
                        key={label}
                        className="flex justify-between gap-4 border-b border-black/5 pb-3 last:border-0 last:pb-0"
                      >
                        <span className="text-gray-500">{label}</span>
                        <span className="text-right">{value}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="relative overflow-hidden rounded-[2rem] bg-white/50 backdrop-blur-xl border border-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.06)] my-20 p-10 md:p-16 text-center">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#c8c0b3]/30 rounded-full blur-3xl" />

            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Thoughtfully designed
              </p>

              <h2 className="text-4xl md:text-5xl font-light mt-4">
                Buy less. <span className="italic">Choose well.</span>
              </h2>

              <p className="max-w-lg mx-auto text-gray-500 mt-5 leading-relaxed">
                Discover timeless essentials designed to become a lasting part
                of your everyday wardrobe.
              </p>

              <button
                type="button"
                onClick={() => navigate("/Home")}
                className="mt-8 px-7 py-4 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition"
              >
                Continue Shopping
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }
  if (!showNotFound) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
        <h1 className="text-2xl md:text-3xl font-light text-gray-500 animate-pulse">
          Loading product...
        </h1>
      </main>
    );
  }
  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#171717]">
      <Navbar onCartClick={openCart} cartCount={cartCount} />

      <main className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
        <h1 className="text-3xl md:text-5xl font-light">Product not found.</h1>
        <p className="mt-4 text-gray-500">
          The product you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate("/Home")}
          className="mt-7 rounded-full bg-black px-7 py-3 text-white hover:bg-gray-800 transition"
        >
          Back to Home
        </button>
      </main>

      <Cart
        isOpen={isCartOpen}
        onClose={closeCart}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />
    </div>
  );
};

export default ProductDetail;
