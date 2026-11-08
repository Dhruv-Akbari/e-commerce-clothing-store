import React, { useState } from "react";
import useCart from "../context/CartContext";
import { GetAllProducts } from "../api/api";
import axios from "axios";
import {
  Home,
  ShoppingBag,
  Info,
  Mail,
  Search,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount, openCart } = useCart();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

const user = JSON.parse(localStorage.getItem("user") || "{}");

const userName = user.Name || "User";
const email = user.Email || "";
const userInitial = userName.trim().charAt(0).toUpperCase() || "U";

  const handleSearchToggle = async () => {
    const willOpen = !isSearchOpen;

    setIsSearchOpen(willOpen);
    setIsProductOpen(false);
    setIsUserOpen(false);

    if (willOpen && allProducts.length === 0) {
      try {
        setSearchLoading(true);
        setSearchError("");

        const response = await GetAllProducts();


        const products = Array.isArray(response)
          ? response
          : response?.products || response?.data || [];

        setAllProducts(products);
      } catch (error) {
        console.error("Product search error:", error);
        setSearchError("Products load nahi ho paaye. Dobara try karo.");
      } finally {
        setSearchLoading(false);
      }
    }

    if (!willOpen) {
      setSearchQuery("");
    }
  };

  const filteredProducts = allProducts
    .filter((product) => {
      const productName = product.name || product.Name || product.title || "";

      return productName
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
    })
    .slice(0, 6);

  const handelogout = async () => {
    try {
      await axios.post(
        "https://e-commerce-clothing-store-wzw0.onrender.com/api/auth/logout",
        {},
        { withCredentials: true },
      );
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/", { replace: true });
    }
  };

  const goTo = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsProductOpen(false);
  };

  const handleCartClick = () => {
    setIsMenuOpen(false);
    setIsProductOpen(false);

    openCart();
  };

  return (
    <nav className="fixed left-1/2 top-3 z-50 w-[94%] max-w-6xl -translate-x-1/2">
      <div className="relative rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-lg shadow-gray-200/40 backdrop-blur-xl sm:px-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => goTo("/Home")}
            className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl"
          >
            CORAS
          </button>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-7 md:flex">
            <button
              type="button"
              onClick={() => goTo("/Home")}
              className="group relative flex items-center gap-2 py-2 text-[17px] font-medium text-gray-700 transition-colors duration-300 hover:text-gray-950"
            >
              <Home
                size={18}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:-translate-y-0.5"
              />
              <span>Home</span>
            </button>

            {/* PRODUCT DROPDOWN */}
            <div
              className="relative"
              onMouseEnter={() => setIsProductOpen(true)}
              onMouseLeave={() => {
                setIsProductOpen(false);
              }}
            >
              <button
                type="button"
                onClick={() => setIsProductOpen(!isProductOpen)}
                className="group relative flex items-center gap-2 py-2 text-[17px] font-medium text-gray-700 transition-colors duration-300 hover:text-gray-950"
              >
                <ShoppingBag
                  size={18}
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5"
                />
                <span>Product</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${isProductOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* DROPDOWN MENU */}
              <div
                className={`absolute left-1/2 top-full mt-2 w-52 -translate-x-1/2 rounded-2xl border border-white/80 bg-white/90 p-2 shadow-xl shadow-gray-200/40 backdrop-blur-xl transition-all duration-200 ${
                  isProductOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-2 opacity-0"
                }`}
              >
                <button
                  type="button"
                  
                  onClick={() =>{ sessionStorage.setItem("scrollToMaleProducts", "true");  goTo("/MaleProduct")}}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[16px] font-medium text-gray-700 hover:bg-gray-100 hover:text-black"
                >
                  Men
                </button>
                <button
                  type="button"
                  onClick={() => { sessionStorage.setItem("scrollToWomenProducts", "true"); goTo("/WomanProduct")}}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[16px] font-medium text-gray-700 hover:bg-gray-100 hover:text-black"
                >
                  Women
                </button>
              </div>
            </div>

            <button
              onClick={() => goTo("/About")}
              className="group relative flex items-center gap-2 py-2 text-[17px] font-medium text-gray-700 transition-colors duration-300 hover:text-gray-950"
            >
              <Info
                size={18}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:-translate-y-0.5"
              />
              <span>About</span>
            </button>
            <button
              onClick={() => goTo("/Contact")}
              className="group relative flex items-center gap-2 py-2 text-[17px] font-medium text-gray-700 transition-colors duration-300 hover:text-gray-950"
            >
              <Mail
                size={18}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:-translate-y-0.5"
              />
              <span>Contact</span>
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={handleSearchToggle}
                aria-label="Search products"
                aria-expanded={isSearchOpen}
                className="group rounded-xl p-2 text-gray-600 hover:bg-white/80 sm:p-2.5"
              >
                {isSearchOpen ? (
                  <X size={19} />
                ) : (
                  <Search
                    size={19}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                )}
              </button>

              {isSearchOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 w-[min(340px,85vw)] rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-500"
                  />

                  <div className="mt-2 max-h-80 overflow-y-auto">
                    {searchLoading ? (
                      <p className="px-3 py-4 text-center text-sm text-gray-500">
                        Loading products...
                      </p>
                    ) : searchError ? (
                      <p className="px-3 py-4 text-center text-sm text-red-500">
                        {searchError}
                      </p>
                    ) : searchQuery.trim() === "" ? (
                      <p className="px-3 py-4 text-center text-sm text-gray-500">
                        Search by product name
                      </p>
                    ) : filteredProducts.length === 0 ? (
                      <p className="px-3 py-4 text-center text-sm text-gray-500">
                        No products found
                      </p>
                    ) : (
                      filteredProducts.map((product) => (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");

                            navigate(`/ProductDetails/${product._id}`);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-gray-100"
                        >
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {(product.Images?.[0]?.url ||
                              product.images?.[0]?.url ||
                              product.image) && (
                              <img
                                src={
                                  product.Images?.[0]?.url ||
                                  product.images?.[0]?.url ||
                                  product.image
                                }
                                alt={product.name || product.Name || "Product"}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {product.name || product.Name || product.title}
                            </p>
                            {product.price != null && (
                              <p className="mt-1 text-xs text-gray-500">
                                {product.currency || "USD"} {product.price}
                              </p>
                            )}
                          </div>

                          <ChevronRight
                            size={16}
                            className="shrink-0 text-gray-400"
                          />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DESKTOP CART */}
            <button
              type="button"
              onClick={handleCartClick}
              className="group relative rounded-xl p-2 text-gray-600 hover:bg-white/80 sm:p-2.5"
            >
              <ShoppingCart
                size={19}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
            {/* USER PROFILE DROPDOWN */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsUserOpen(!isUserOpen);
                  setIsProductOpen(false);
                }}
                className="flex h-10 w-10 items-center justify-center
      rounded-full border border-white/80 bg-white/80 text-gray-900 text-lg font-bold shadow-md shadow-gray-200/40 backdrop-blur-xl transition-all duration-300 hover:bg-white hover:shadow-lg focus:outline-nonefocus:ring-2 focus:ring-gray-300"
                aria-label="Open user profile"
                aria-expanded={isUserOpen}
              >
                {userInitial}
              </button>

              {/* PROFILE DROPDOWN */}
              <div
                className={`absolute right-0 top-full mt-3 w-60
      rounded-2xl border border-white/80
      bg-white/90 p-2 shadow-xl shadow-gray-200/40
      backdrop-blur-xl transition-all duration-200
      ${
        isUserOpen
          ? "visible translate-y-0 opacity-100"
          : "invisible -translate-y-2 opacity-0"
      }`}
              >
                <div className="border-b border-gray-200/70 px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center
          justify-center rounded-full border border-white/80
          bg-white/80 text-lg font-bold text-gray-900
          shadow-sm"
                    >
                      {userInitial}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {userName}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {email || "Welcome to CORAS"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => goTo("/AddAddress")}
                  className="flex w-full items-center gap-3 rounded-xl
        px-3 py-3 text-left text-sm font-medium text-gray-700
        transition-colors duration-200
        hover:bg-white/80 hover:text-gray-950"
                >
                  <MapPin size={18} strokeWidth={1.8} />
                  <span>Add Address</span>
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/ViewOrders")}
                  className="flex w-full items-center gap-3 rounded-xl
        px-3 py-3 text-left text-sm font-medium text-gray-700
        transition-colors duration-200
        hover:bg-white/80 hover:text-gray-950"
                >
                  <ShoppingBag size={18} strokeWidth={1.8} />
                  <span>View Orders</span>
                </button>


                <div className="my-1 border-t border-gray-200/70" />

                <button
                  type="button"
                  onClick={handelogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-70 transition-colors duration-200 hover:bg-red-50/80 hover:text-red-600"
                >
                  <LogOut size={18} strokeWidth={1.8} />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-xl p-2 text-gray-700 hover:bg-white/80 md:hidden"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${isMenuOpen ? "mt-3 max-h-[700px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="border-t border-gray-200/70 pt-3">
            <button
              onClick={() => goTo("/Home")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-700 hover:bg-white/70"
            >
              <Home size={19} />
              <span>Home</span>
            </button>

            <button
              onClick={() =>{ sessionStorage.setItem("scrollToMaleProducts", "true");  goTo("/MaleProduct")}}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-700 hover:bg-white/70"
            >
              <ShoppingBag size={19} />
              <span>Men</span>
            </button>

            <button
              onClick={() => {sessionStorage.setItem("scrollToWomenProducts", "true"); goTo("/WomanProduct")}}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-700 hover:bg-white/70"
            >
              <ShoppingBag size={19} />
              <span>Women</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
