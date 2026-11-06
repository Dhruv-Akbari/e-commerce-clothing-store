import { useState } from "react";
import Navbar from "../components/navbar";
import Cart from "../components/cart/cart";
import useCart from "../context/CartContext";
const Contact = () => {
  const [formData, setFormData] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    return {
      name: user?.Name || "",
      email: user?.Email || "",
      subject: "",
      message: "",
    };
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setStatus("");

      const response = await fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      setStatus("Message sent successfully!");

      setFormData((prev) => ({
        ...prev,
        subject: "",
        message: "",
      }));
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

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
        {/* Header */}
        <section
          className="relative overflow-hidden rounded-[2rem]
          bg-white/50 backdrop-blur-xl border border-white/70
          shadow-[0_20px_60px_rgba(0,0,0,0.06)]
          px-7 py-14 md:px-14 md:py-20"
        >
          <div
            className="absolute -top-32 -right-20 w-80 h-80
            rounded-full bg-[#ddc8ac]/40 blur-3xl"
          />

          <div
            className="absolute -bottom-40 left-1/3 w-96 h-96
            rounded-full bg-[#c8d8d0]/40 blur-3xl"
          />

          <div className="relative z-10 text-center">
            <span
              className="inline-block px-4 py-2 rounded-full
              bg-white/60 backdrop-blur-md border border-white
              text-[10px] uppercase tracking-[0.3em] text-gray-500"
            >
              Get in touch
            </span>

            <h1
              className="text-5xl md:text-7xl font-light
              tracking-tight mt-6"
            >
              Let's talk <span className="italic">things.</span>
            </h1>

            <p className="max-w-xl mx-auto mt-5 text-gray-500 leading-relaxed">
              Questions about an order, our collection, or simply want to say
              hello? We'd love to hear from you.
            </p>
          </div>
        </section>

       
{/* Contact Layout */}
<section className="grid lg:grid-cols-2 gap-6 my-12">

  {/* Left Contact Info */}
  <div className="rounded-[2rem] bg-[#e4e0d7] p-8 md:p-12 flex flex-col justify-between min-h-[520px]">

    <div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
        Contact
      </p>

      <h2 className="text-4xl md:text-6xl font-light mt-6 leading-tight">
        We'd love to
        <span className="italic"> hear from you.</span>
      </h2>

      <p className="text-gray-500 mt-6 leading-relaxed max-w-sm">
        Have a question about an order, our collection, or something else?
        We're always happy to help.
      </p>
    </div>

    <div className="space-y-7 mt-12">

      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
          Email
        </p>

        <a
          href="mailto:bgmindwhcload@gmail.com"
          className="inline-block mt-2 text-lg hover:opacity-50 transition"
        >
          bgmindwhcload@gmail.com
        </a>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
          Hours
        </p>
        <p className="mt-2 text-gray-600">
          Monday — Friday<br />
          9:00 AM — 6:00 PM
        </p>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
          Follow along
        </p>

        <div className="flex gap-5 mt-3">
          <a href="#" className="text-sm underline underline-offset-4 hover:opacity-50 transition">
            Instagram
          </a>

          <a href="#" className="text-sm underline underline-offset-4 hover:opacity-50 transition">
            Pinterest
          </a>
        </div>
      </div>

    </div>
  </div>

  {/* Right Email Card */}
  <div className="relative overflow-hidden rounded-[2rem]
    bg-white/50 backdrop-blur-xl border border-white/70
    shadow-[0_20px_60px_rgba(0,0,0,0.05)]
    p-8 md:p-12 flex flex-col justify-between min-h-[520px]">

    <div className="absolute -top-32 -right-20 w-80 h-80
      rounded-full bg-[#ddc8ac]/30 blur-3xl" />

    <div className="absolute -bottom-32 -left-20 w-80 h-80
      rounded-full bg-[#c8d8d0]/30 blur-3xl" />

    <div className="relative z-10">

      <div className="w-16 h-16 rounded-full bg-[#e4e0d7]
        flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </div>

      <p className="text-[10px] uppercase tracking-[0.3em]
        text-gray-400 mt-12">
        Drop us a line
      </p>

      <h2 className="text-4xl md:text-5xl font-light
        tracking-tight mt-5 leading-tight">
        Let's make
        <span className="italic"> something happen.</span>
      </h2>

      <p className="text-gray-500 mt-5 leading-relaxed max-w-sm">
        Reach out directly through email. Whether it's a question,
        feedback, or just a hello, our inbox is always open.
      </p>

    </div>

    <div className="relative z-10 mt-16">

      <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
        Write to us at
      </p>

      <p className="text-lg md:text-2xl font-light break-all tracking-tight">
        bgmindwhcload@gmail.com
      </p>

      <a
        href="mailto:bgmindwhcload@gmail.com"
        className="mt-8 w-full py-5 rounded-full bg-black
          text-white text-sm font-medium flex items-center
          justify-center gap-3 hover:bg-gray-800 transition"
      >
        Send us an email
        <span>↗</span>
      </a>

      <p className="text-center text-xs text-gray-400 mt-5">
        We usually respond within 1–2 business days.
      </p>

    </div>

  </div>

</section>


        {/* FAQ / Bottom CTA */}
        <section
          className="relative overflow-hidden rounded-[2rem]
          bg-white/50 backdrop-blur-xl border border-white/70
          shadow-[0_20px_60px_rgba(0,0,0,0.06)]
          my-20 p-10 md:p-16 text-center"
        >
          <div
            className="absolute -top-40 left-1/2 -translate-x-1/2
            w-96 h-96 bg-[#d8c4a8]/30 rounded-full blur-3xl"
          />

          <div className="relative z-10">
            <p
              className="text-xs uppercase tracking-[0.3em]
              text-gray-500"
            >
              Need something else?
            </p>

            <h2 className="text-4xl md:text-5xl font-light mt+-4">
              Start with our
              <span className="italic"> collection.</span>
            </h2>

            <button
              className="mt-8 px-7 py-4 rounded-full bg-black
                text-white text-sm hover:bg-gray-800 transition"
            >
              Explore Products
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
