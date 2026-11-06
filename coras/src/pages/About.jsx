import React from "react";
import Navbar from "../components/navbar";
import useCart from "../context/CartContext";
import Cart from "../components/cart/cart";

const values = [
  {
    number: "01",
    title: "Intentional Design",
    text: "Every piece begins with a simple idea: create something beautiful, useful, and easy to live in.",
  },
  {
    number: "02",
    title: "Made to Last",
    text: "We choose timeless silhouettes and considered materials so your wardrobe can evolve without constantly changing.",
  },
  {
    number: "03",
    title: "Less, But Better",
    text: "We believe a thoughtful wardrobe is built around fewer pieces that work harder and feel better.",
  },
];

const About = () => {
  const {
    isCartOpen,
    cartItems,
    updateQuantity,
    removeItem,
    openCart,
    closeCart,
  } = useCart();
  const cartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );
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

      <main className="px-5 md:px-10 lg:px-16 py-8">
        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-[2rem]
          bg-white/50 backdrop-blur-xl border border-white/70
          shadow-[0_20px_60px_rgba(0,0,0,0.06)]
          px-7 py-16 md:px-14 md:py-24"
        >
          <div
            className="absolute -top-40 -right-20 w-96 h-96
            rounded-full bg-[#ddc8ac]/40 blur-3xl"
          />

          <div
            className="absolute -bottom-40 left-1/4 w-96 h-96
            rounded-full bg-[#c8d8d0]/40 blur-3xl"
          />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <span
              className="inline-block px-4 py-2 rounded-full
              bg-white/60 backdrop-blur-md border border-white
              text-[10px] uppercase tracking-[0.3em] text-gray-500"
            >
              Our Story
            </span>

            <h1
              className="text-5xl md:text-7xl font-light
              tracking-tight mt-6 leading-[1.05]"
            >
              Designed for <span className="italic">real life.</span>
            </h1>

            <p
              className="max-w-2xl mx-auto mt-7 text-gray-500
              leading-relaxed text-base md:text-lg"
            >
              We create quiet, considered clothing for people who believe
              personal style is less about following trends and more about
              knowing what feels like you.
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="grid lg:grid-cols-2 gap-6 my-16">
          <div
            className="relative min-h-[500px] overflow-hidden rounded-[2rem]
            bg-[#dedbd2]"
          >
            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=85"
              alt="Minimal clothing collection"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div
              className="absolute inset-0 bg-gradient-to-t
              from-black/30 via-transparent to-transparent"
            />

            <div className="absolute bottom-7 left-7 text-white">
              <p className="text-[10px] uppercase tracking-[0.3em]">
                Since 2024
              </p>
              <p className="text-2xl font-light mt-2">
                Simplicity, thoughtfully made.
              </p>
            </div>
          </div>

          <div
            className="rounded-[2rem]
            bg-white/50 backdrop-blur-xl border border-white/70
            shadow-[0_20px_60px_rgba(0,0,0,0.05)]
            p-8 md:p-12 flex flex-col justify-center"
          >
            <p
              className="text-[10px] uppercase tracking-[0.3em]
              text-gray-400"
            >
              Why we exist
            </p>

            <h2 className="text-4xl md:text-5xl font-light mt-5 leading-tight">
              Clothes that leave
              <span className="italic"> room for you.</span>
            </h2>

            <div className="space-y-5 mt-7 text-gray-500 leading-relaxed">
              <p>
                Fashion can be loud. We wanted to create something quieter. A
                collection built around clean lines, natural textures, and
                pieces that feel effortless from the first wear.
              </p>

              <p>
                Our approach is simple: design fewer things, think about them
                longer, and make each piece earn its place in your wardrobe.
              </p>

              <p>
                Because the best clothes aren't the ones that define you.
                They're the ones that let you be yourself.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-10">
          <div className="text-center mb-12">
            <p
              className="text-[10px] uppercase tracking-[0.3em]
              text-gray-400"
            >
              What guides us
            </p>

            <h2 className="text-4xl md:text-5xl font-light mt-4">
              Our <span className="italic">principles.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {values.map((value) => (
              <div
                key={value.number}
                className="rounded-[1.75rem]
                  bg-white/45 backdrop-blur-xl
                  border border-white/70
                  shadow-[0_15px_40px_rgba(0,0,0,0.05)]
                  p-7 md:p-9"
              >
                <span className="text-xs text-gray-400">{value.number}</span>

                <h3 className="text-2xl font-light mt-12">{value.title}</h3>

                <p
                  className="text-sm text-gray-500
                  leading-relaxed mt-4"
                >
                  {value.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quote */}
        <section
          className="relative overflow-hidden rounded-[2rem]
          bg-[#e7e3da] my-20 px-7 py-16 md:px-16 md:py-24 text-center"
        >
          <div
            className="absolute -top-40 -left-20 w-96 h-96
            rounded-full bg-white/60 blur-3xl"
          />

          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-3xl md:text-5xl font-light leading-tight">
              “The goal isn't to have more clothes. It's to have the{" "}
              <span className="italic">right ones.</span>”
            </p>

            <p
              className="text-xs uppercase tracking-[0.3em]
              text-gray-500 mt-8"
            >
              Our philosophy
            </p>
          </div>
        </section>

        {/* CTA */}
        <section
          className="relative overflow-hidden rounded-[2rem]
          bg-white/50 backdrop-blur-xl border border-white/70
          shadow-[0_20px_60px_rgba(0,0,0,0.06)]
          mb-12 p-10 md:p-16 text-center"
        >
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
              Discover the collection
            </p>

            <h2 className="text-4xl md:text-5xl font-light mt-4">
              Find something that feels
              <span className="italic"> like you.</span>
            </h2>

            <button
              className="mt-8 px-7 py-4 rounded-full bg-black
                text-white text-sm hover:bg-gray-800 transition"
            >
              Shop Collection
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
