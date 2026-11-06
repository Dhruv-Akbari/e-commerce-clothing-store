import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import Cart from "../../components/cart/cart";
import useCart from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { GetAllProducts } from "../../api/api";


const categories = [
  "All",
  "Tops",
  "Shirts",
  "T-Shirts",
  "Outerwear",
  "Trousers",
  "Knitwear",
  "Jeans",
];

const WomanProduct = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [Products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("default");
  const [selectedSize, setSelectedSize] = useState("All");
  const GoTo = (path) => {
    navigate(path);
  };
  const { isCartOpen, cartItems, updateQuantity, removeItem, closeCart } =
    useCart();

  useEffect(() => {
    setVisibleCount(10);
  }, [activeCategory, selectedSize, sortBy]);

  const cartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const response = await GetAllProducts();

        if (response.success) {
          const womensProducts = response.data.filter(
            (product) => product.gender === "Women",
          );
          setProducts(womensProducts);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchdata();
  }, []);

  const filteredProducts =
    activeCategory === "All"
      ? Products
      : Products.filter((product) => product.category === activeCategory);

  const sortedProducts = [...filteredProducts]
    .filter((product) => {
      if (selectedSize === "All") return true;

      return product.sizes?.some((size) => String(size) === selectedSize);
    })
    .sort((a, b) => {
      if (sortBy === "low-high") {
        return Number(a.price) - Number(b.price);
      }

      if (sortBy === "high-low") {
        return Number(b.price) - Number(a.price);
      }

      return 0;
    });

  const visibleProducts = sortedProducts.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#171717]">
      <Navbar onCartClick={() => isCartOpen(true)} cartCount={cartCount} />

      {/* Cart Popup */}
      <Cart
        isOpen={isCartOpen}
        onClose={closeCart}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />

      <main className="px-5 md:px-10 lg:px-16 py-8">
        {/* Header */}
        <section
          className="relative overflow-hidden rounded-[2rem]
          bg-white/50 backdrop-blur-xl border border-white/70
          shadow-[0_20px_60px_rgba(0,0,0,0.06)]
          px-7 py-12 md:px-14 md:py-16"
        >
          {/* Decorative Glow */}
          <div
            className="absolute -top-32 -right-20 w-80 h-80
            rounded-full bg-[#ddc8ac]/40 blur-3xl"
          />

          <div
            className="absolute -bottom-40 left-1/3 w-96 h-96
            rounded-full bg-[#d8c8d0]/40 blur-3xl"
          />

          <div className="relative z-10 text-center">
            <span
              className="inline-block px-4 py-2 rounded-full
              bg-white/60 backdrop-blur-md border border-white
              text-[10px] uppercase tracking-[0.3em] text-gray-500"
            >
              The Women's Collection
            </span>

            <h1
              className="text-5xl md:text-7xl font-light
              tracking-tight mt-6"
            >
              Effortless <span className="italic">essentials.</span>
            </h1>

            <p
              className="max-w-xl mx-auto mt-5 text-gray-500
              leading-relaxed"
            >
              Thoughtfully designed pieces made to bring ease, confidence, and
              timeless style to every day.
            </p>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="sticky top-4 z-20 mt-8">
          <div
            className="flex gap-2 overflow-x-auto p-2 rounded-full
            bg-white/60 backdrop-blur-xl border border-white/80
            shadow-lg w-fit max-w-full mx-auto"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full
                  text-sm transition-all duration-300
                  ${
                    activeCategory === category
                      ? "bg-black text-white shadow-md"
                      : "text-gray-600 hover:bg-white"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>
        {/* Product Count & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-12 mb-6">
          <p className="text-sm text-gray-500 tracking-wide">
            {sortedProducts.length} pieces
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {/* Size Filter */}
            <div className="relative">
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="appearance-none cursor-pointer outline-none
        pl-5 pr-10 py-3 rounded-full
        bg-white/60 backdrop-blur-xl
        border border-white/80 shadow-sm
        text-sm text-gray-600
        hover:bg-white transition-all duration-300"
              >
                <option value="All">All Sizes</option>
                {[
                  "XS",
                  "S",
                  "M",
                  "L",
                  "XL",
                  "XXL",
                  "28",
                  "30",
                  "32",
                  "34",
                  "36",
                  "38",
                  "40",
                  "42",
                ].map((size) => (
                  <option key={size} value={size}>
                    Size {size}
                  </option>
                ))}
              </select>

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
                ↓
              </span>
            </div>

            {/* Price Sorting */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none cursor-pointer outline-none
        pl-5 pr-10 py-3 rounded-full
        bg-white/60 backdrop-blur-xl
        border border-white/80 shadow-sm
        text-sm text-gray-600
        hover:bg-white transition-all duration-300"
              >
                <option value="default">Sort by</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
                ↓
              </span>
            </div>

            {/* Reset */}
            <button
              type="button"
              onClick={() => {
                setSortBy("default");
                setSelectedSize("All");
                setActiveCategory("All");
              }}
              className="px-5 py-3 rounded-full bg-white/60 backdrop-blur-xl border border-white/80 shadow-sm text-sm text-gray-500 hover:bg-black hover:text-white active:scale-80 transition-all duration-300"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2
          lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {visibleProducts.map((product) => (
            <div
              onClick={() => GoTo(`/ProductDetails/${product._id}`)}
              key={product._id}
              className="group relative rounded-[1.5rem]
                bg-white/40 backdrop-blur-xl
                border border-white/70
                p-3 shadow-[0_15px_40px_rgba(0,0,0,0.05)]
                hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)]
                transition-all duration-500"
            >
              {/* Image */}
              <div
                className="relative aspect-[4/5] overflow-hidden
                rounded-[1.2rem] bg-[#e9e7e0]"
              >
                <img
                  src={product.Images?.[0]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover
                    group-hover:scale-105 transition-transform
                    duration-700"
                />

                {/* Favorite */}
                <button
                  aria-label={`Add ${product.name} to favorites`}
                  className="absolute top-3 right-3 w-10 h-10
                    rounded-full bg-white/60 backdrop-blur-xl
                    border border-white/80 flex items-center
                    justify-center text-lg hover:bg-white
                    transition"
                >
                  ♡
                </button>
              </div>

              {/* Product Details */}
              <div className="px-2 pt-4 pb-2">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p
                      className="text-[10px] uppercase
                      tracking-[0.2em] text-gray-400"
                    >
                      {product.category}
                    </p>

                    <h3 className="font-medium mt-1">{product.name}</h3>
                  </div>

                  <p className="font-medium whitespace-nowrap">
                    ₹{product.price}
                  </p>
                </div>

                {/* Material */}
                <div className="mt-4">
                  <span className="text-xs text-gray-500 tracking-wide">
                    Material:
                  </span>
                  <span className="text-xs font-medium text-gray-800 ml-1">
                    {product.material || "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Load More */}
        {visibleCount < sortedProducts.length && (
          <div className="flex flex-col items-center mt-12">
            <p className="text-sm text-gray-500 mb-4">
              Showing {visibleProducts.length} of {sortedProducts.length} pieces
            </p>

            <button
              onClick={() => setVisibleCount((prev) => prev + 10)}
              className="px-8 py-3.5 rounded-full
        bg-white/60 backdrop-blur-xl
        border border-white/80 shadow-sm
        text-sm tracking-wide text-gray-700
        hover:bg-black hover:text-white
        active:scale-95 transition-all duration-300"
            >
              Load More
            </button>
          </div>
        )}
        {/* Bottom CTA */}
        <section
          className="relative overflow-hidden rounded-[2rem]
          bg-white/50 backdrop-blur-xl border border-white/70
          shadow-[0_20px_60px_rgba(0,0,0,0.06)]
          my-24 p-10 md:p-16 text-center"
        >
          {/* Decorative Glow */}
          <div
            className="absolute -top-40 left-1/2 -translate-x-1/2
            w-96 h-96 bg-[#d8c4a8]/30 rounded-full blur-3xl"
          />

          <div className="relative z-10">
            <p
              className="text-xs uppercase tracking-[0.3em]
              text-gray-500"
            >
              Made for every moment
            </p>

            <h2 className="text-4xl md:text-5xl font-light mt-4">
              Less trends. <span className="italic">More you.</span>
            </h2>

            <p className="max-w-lg mx-auto text-gray-500 mt-5">
              Discover timeless pieces designed to move with you, blending
              comfort, simplicity, and effortless style.
            </p>

            <button
              className="mt-8 px-7 py-4 rounded-full bg-black
                text-white text-sm hover:bg-gray-800 transition"
            >
              Explore Our Story
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WomanProduct;
