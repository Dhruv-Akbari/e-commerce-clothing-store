import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import useCart from "../context/CartContext";
import Cart from "../components/cart/cart";

const Home = () => {
  const navigate = useNavigate();
  const { isCartOpen, cartItems, updateQuantity, removeItem, closeCart } =
    useCart();

  const categories = [
    {
      title: "Women",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=85",
      path: "/WomanProduct",
    },
    {
      title: "Men",
      image:
        "https://imgs.search.brave.com/Lax9ng2YRom9A4unNAfvWZAL0wjj6ln94hD0jitJ5rc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9nZW50/ZWRnZS5jb20vd3At/Y29udGVudC91cGxv/YWRzLzIwMjUvMDYv/b3V0Zml0LWlkZWFz/LWZvci1tZW4tYWVz/dGhldGljLndlYnA ",
      path: "/MaleProduct",
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#171717] overflow-hidden">
      <Navbar />
      <Cart
        isOpen={isCartOpen}
        onClose={closeCart}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />

      {/* Hero Section */}
      <main className="px-6 md:px-12 lg:px-20 pt-8">
        <section
          className="relative min-h-[85vh] rounded-[2rem] overflow-hidden
          bg-white/50 backdrop-blur-xl border border-white/70
          shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
        >
          {/* Decorative Blur */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96
            bg-[#d8c3a5]/40 rounded-full blur-3xl"
          />

          <div
            className="absolute -bottom-32 -left-32 w-96 h-96
            bg-[#c9d8d1]/50 rounded-full blur-3xl"
          />

          <div
            className="relative z-10 grid lg:grid-cols-2
            items-center min-h-[85vh] gap-10 p-8 md:p-14 lg:p-20"
          >
            {/* Left Content */}
            <div className="max-w-xl">
              <span
                className="inline-block px-4 py-2 mb-6 rounded-full
                bg-white/60 backdrop-blur-md border border-white
                text-xs tracking-[0.25em] uppercase text-gray-600"
              >
                New Collection · 2026
              </span>

              <h1
                className="text-5xl md:text-6xl lg:text-7xl
                font-light leading-[0.95] tracking-tight"
              >
                Wear your
                <span className="block font-medium italic">confidence.</span>
              </h1>

              <p
                className="mt-7 text-gray-600 text-base md:text-lg
                leading-relaxed max-w-md"
              >
                Timeless essentials designed for modern living. Discover
                effortless silhouettes, premium fabrics, and understated luxury.
              </p>

              <div className="flex flex-wrap gap-4 mt-9">
                <button
                  onClick={() => navigate("/WomanProduct")}
                  className="px-7 py-4 rounded-full bg-black text-white
                  text-sm tracking-wide hover:bg-gray-800 transition"
                >
                  Shop Collection
                </button>

                <button
                  onClick={() => navigate("/WomanProduct")}
                  className="px-7 py-4 rounded-full bg-white/60
                  backdrop-blur-md border border-white text-sm
                  hover:bg-white transition"
                >
                  Explore Lookbook
                </button>
              </div>

              {/* Small Stats */}
              <div className="flex gap-10 mt-14 pt-7 border-t border-black/10">
                <div>
                  <p className="text-2xl font-medium">50+</p>
                  <p className="text-xs text-gray-500 mt-1">New Pieces</p>
                </div>

                <div>
                  <p className="text-2xl font-medium">100%</p>
                  <p className="text-xs text-gray-500 mt-1">Premium Quality</p>
                </div>

                <div>
                  <p className="text-2xl font-medium">24/7</p>
                  <p className="text-xs text-gray-500 mt-1">Style Support</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative flex justify-center items-center">
              <div className="relative w-full max-w-lg aspect-[4/5]">
                <div
                  className="absolute inset-4 rounded-[2rem]
                  bg-white/20 backdrop-blur-md border border-white/60
                  shadow-2xl rotate-3"
                />

                <div
                  className="absolute inset-0 rounded-[2rem]
                  overflow-hidden shadow-2xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85"
                    alt="Fashion model wearing our collection"
                    className="w-full h-full object-cover"
                  />

                  <div
                    className="absolute inset-0
                    bg-gradient-to-t from-black/30 via-transparent to-transparent"
                  />
                </div>

                <div
                  className="absolute -bottom-5 -left-5 md:-left-10
                  px-5 py-4 rounded-2xl bg-white/60 backdrop-blur-xl
                  border border-white/80 shadow-xl"
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.2em]
                    text-gray-500"
                  >
                    Featured
                  </p>

                  <p className="mt-1 font-medium">The Essential Edit</p>
                </div>

                <div
                  className="absolute -top-5 -right-5 md:-right-8
                  w-16 h-16 rounded-full bg-white/60 backdrop-blur-xl
                  border border-white flex items-center justify-center
                  shadow-lg"
                >
                  <span className="text-xs tracking-widest">01</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-24">
          <div
            className="flex flex-col md:flex-row
            md:items-end justify-between gap-5 mb-10"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Shop by style
              </p>

              <h2 className="text-4xl md:text-5xl font-light mt-3">
                Find your <span className="italic">look.</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {categories.map((category) => (
              <div
                key={category.title}
                onClick={() => navigate(category.path)}
                className="group relative h-[420px] rounded-[1.75rem]
                  overflow-hidden cursor-pointer"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover
                    group-hover:scale-105 transition duration-700"
                />

                <div
                  className="absolute inset-0 bg-gradient-to-t
                  from-black/50 via-transparent to-transparent"
                />

                <div
                  className="absolute bottom-7 left-7 right-7
                  flex items-center justify-between text-white"
                >
                  <h3 className="text-2xl font-light">{category.title}</h3>

                  <div
                    className="w-10 h-10 rounded-full
                    bg-white/20 backdrop-blur-md border border-white/40
                    flex items-center justify-center"
                  >
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter Glass Card */}
        <section className="mb-20">
          <div
            className="relative overflow-hidden rounded-[2rem]
            bg-white/50 backdrop-blur-xl border border-white/70
            shadow-[0_20px_60px_rgba(0,0,0,0.06)]
            p-10 md:p-16 text-center"
          >
            <div
              className="absolute w-72 h-72 bg-[#dfc9ae]/30
              rounded-full blur-3xl -top-32 left-1/4"
            />

            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Stay in the loop
              </p>

              <h2 className="text-4xl md:text-5xl font-light mt-4">
                Style starts <span className="italic">here.</span>
              </h2>

              <p className="text-gray-500 max-w-md mx-auto mt-5">
                Get early access to new collections, exclusive drops, and
                stories from our world.
              </p>

              <div
                className="max-w-md mx-auto flex gap-2 mt-8
                p-2 rounded-full bg-white/60 backdrop-blur-md
                border border-white"
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 min-w-0 bg-transparent px-4
                    outline-none text-sm"
                />

                <button
                  className="px-6 py-3 rounded-full bg-black
                  text-white text-sm hover:bg-gray-800 transition"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
