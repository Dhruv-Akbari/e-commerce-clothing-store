import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import { getUserAddresses, getCartItems , createOrder,initiatePayment} from "../../api/api";
import useUserId from "../../context/useUserId";

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const SHIPPING_FEE = 99;
const FREE_SHIPPING_LIMIT = 599;

const Checkout = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
const [paymentMethod, setPaymentMethod] = useState("COD");
  const userId = useUserId();

  useEffect(() => {
    const fetchdata = async () => {
      try {
        // Wait until userId is available
        if (!userId) {
          console.error("No user ID found! Please log in.");
          return;
        }

        const data = await getUserAddresses(userId);

        const addressList = Array.isArray(data)
          ? data
          : data?.addresses || data?.data || [];

        const mappedList = addressList.map((addr) => {
          let parsedId = addr.id;

          if (!parsedId && addr._id) {
            parsedId =
              typeof addr._id === "object" && addr._id.$oid
                ? addr._id.$oid
                : addr._id;
          }

          return { ...addr, id: parsedId };
        });

        setAddresses(mappedList);
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
        setAddresses([]);
      }
    };

    fetchdata();
  }, [userId]);

  // Load cart items and saved addresses from localStorage
  useEffect(() => {
    const fetchdata = async () => {
      try {
        if (!userId) {
          console.log("User ID not found.");
          return;
        }

        const response = await getCartItems(userId);

        // Extract the items array from the nested data object
        if (response?.success && response?.data?.items) {
          setCartItems(response.data.items);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Unable to load checkout data:", error);
        setCartItems([]);
      }
    };
    fetchdata();
  }, [userId]);
  
 

  // Adjusted fields to handle nested `product` object from the API
  const getPrice = (item) => Number(item.product?.price ?? item.price ?? item.productPrice ?? 0);

  const getQuantity = (item) => Math.max(0, Number(item.quantity ?? 1) || 0);

  const getItemName = (item) =>
    item.product?.name ?? item.name ?? item.title ?? item.productName ?? "Product";

  const getItemImage = (item) =>
    item.product?.Image ??
    item.product?.image ??
    item.product?.url ??
    item.product?.Images?.[0]?.url ??
    item.product?.images?.[0]?.url ??
    item.product?.thumbnail ??
    item.Image ??
    item.image ??
    item.url ??
    item.Images?.[0]?.url ??
    item.images?.[0]?.url ??
    item.thumbnail ??
    "";

  const subtotal = cartItems.reduce(
    (total, item) => total + getPrice(item) * getQuantity(item),
    0,
  );

  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_FEE;

  const total = subtotal + shipping;

  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId,
  );

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(price);

  const handlePlaceOrder = async () => {
    setMessage("");

    if (!cartItems.length) return setMessage("Your cart is empty.");
    if (!selectedAddress) return setMessage("Please add or select a delivery address.");

    setLoading(true);

    try {
      if (paymentMethod === "COD") {
        // --- 1. COD FLOW ---
        const payload = {
          shippingAddressId: selectedAddressId,
          paymentMethod: "COD"
        };
        const response = await createOrder(payload);
        if (response.success) {
          navigate('/ViewOrders'); 
        }
      } else {
        // --- 2. ONLINE PAYMENT FLOW ---
        
        // Load Razorpay Script
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
          setMessage("Razorpay SDK failed to load. Are you online?");
          setLoading(false);
          return;
        }

        // Initialize order from backend
        const initResponse = await initiatePayment();
        if (!initResponse.success) {
          setMessage("Failed to initialize payment.");
          setLoading(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZOR_PAY_API_KEY, 
          amount: initResponse.data.amount,
          currency: initResponse.data.currency,
          name: "Your Brand Name",
          description: "Order Payment",
          order_id: initResponse.data.id, // This is the razorpay_order_id
          handler: async function (response) {
            try {
              // Send signature to backend for verification and final order creation
              const payload = {
                shippingAddressId: selectedAddressId,
                paymentMethod: "ONLINE",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              };
              
              const verifyResponse = await createOrder(payload);
              if (verifyResponse.success) {
                navigate('/ViewOrders');
              }
            } catch (err) {
              setMessage("Payment verification failed."+ (err.response?.data?.message || err.message));
            }
          },
          prefill: {
            name: selectedAddress.fullName,
            contact: selectedAddress.phone,
          },
          theme: { color: "#000000" }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response) {
          setMessage("Payment failed. Please try again.");
          setLoading(false);
        });
        paymentObject.open();
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#171717]">
      <Navbar />

      <main className="px-5 md:px-12 lg:px-20 py-10 md:py-14">
        {/* Heading */}
        <div className="max-w-6xl mx-auto mb-10">
          <button
            type="button"
            onClick={() => navigate("/Home")}
            className="text-sm text-gray-500 hover:text-black transition mb-6"
          >
            ← Continue Shopping
          </button>

          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
            Almost yours
          </p>

          <h1 className="text-4xl md:text-6xl font-light mt-3 tracking-tight">
            Secure <span className="italic">checkout.</span>
          </h1>

          <p className="text-gray-500 mt-4 max-w-lg leading-relaxed">
            Review your selection, confirm your delivery details, and get ready
            for your next favorite piece.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className="max-w-6xl mx-auto mb-6 p-4 rounded-2xl
            bg-white/70 border border-white text-sm text-gray-700"
          >
            {message}
          </div>
        )}

        {cartItems.length === 0 ? (
          <section
            className="max-w-6xl mx-auto rounded-[2rem]
            bg-white/50 backdrop-blur-xl border border-white/70
            shadow-[0_20px_60px_rgba(0,0,0,0.05)]
            p-10 md:p-16 text-center"
          >
            <div
              className="w-16 h-16 mx-auto rounded-full bg-white/70
              flex items-center justify-center mb-6"
            >
              <span className="text-2xl">⌂</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-light">
              Your bag is waiting.
            </h2>

            <p className="text-gray-500 mt-4">
              Add something you love before checking out.
            </p>

            <button
              type="button"
              onClick={() => navigate("/Home")}
              className="mt-8 px-7 py-4 rounded-full bg-black text-white
              text-sm hover:bg-gray-800 transition"
            >
              Explore Collection
            </button>
          </section>
        ) : (
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
            {/* Left column */}
            <div className="space-y-8">
              {/* Cart Items */}
              <section
                className="rounded-[2rem] bg-white/50 backdrop-blur-xl
                border border-white/70
                shadow-[0_20px_60px_rgba(0,0,0,0.04)] p-6 md:p-9"
              >
                <div className="flex items-center justify-between gap-4 mb-7">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                      Your selection
                    </p>
                    <h2 className="text-2xl font-light mt-2">
                      Order <span className="italic">items.</span>
                    </h2>
                  </div>

                  <span className="text-sm text-gray-500">
                    {cartItems.reduce(
                      (count, item) => count + getQuantity(item),
                      0,
                    )}{" "}
                    items
                  </span>
                </div>

                <div className="space-y-6">
                  {cartItems.map((item, index) => (
                    <div
                      key={item._id ?? item.product?._id ?? index}
                      className="flex gap-4 pb-6 border-b border-black/10 last:border-0 last:pb-0"
                    >
                      <div
                        className="w-24 h-28 md:w-28 md:h-32 shrink-0
                        rounded-2xl overflow-hidden bg-white/70"
                      >
                        {getItemImage(item) ? (
                          <img
                            src={getItemImage(item)}
                            alt={getItemName(item)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-xs">No image</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <h3 className="font-medium text-sm md:text-base break-words">
                            {getItemName(item)}
                          </h3>

                          {(item.size || item.sizes) && (
                            <p className="text-xs text-gray-500 mt-2">
                              Size:{" "}
                              {item.size ??
                                (Array.isArray(item.sizes)
                                  ? item.sizes.join(", ")
                                  : item.sizes)}
                            </p>
                          )}

                          {(item.color || item.colors) && (
                            <p className="text-xs text-gray-500 mt-1">
                              Color:{" "}
                              {item.color ??
                                (Array.isArray(item.colors)
                                  ? item.colors.join(", ")
                                  : item.colors)}
                            </p>
                          )}

                          <p className="text-xs text-gray-500 mt-2">
                            Quantity: {getQuantity(item)}
                          </p>
                        </div>

                        <p className="font-medium text-sm mt-3">
                          {formatPrice(getPrice(item) * getQuantity(item))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Delivery Address */}
              <section
                className="rounded-[2rem] bg-white/50 backdrop-blur-xl
                border border-white/70
                shadow-[0_20px_60px_rgba(0,0,0,0.04)] p-6 md:p-9"
              >
                <div className="flex items-center justify-between gap-4 mb-7">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                      Where to deliver
                    </p>

                    <h2 className="text-2xl font-light mt-2">
                      Delivery <span className="italic">address.</span>
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/Addaddress")}
                    className="text-xs underline underline-offset-4 hover:text-gray-500 transition"
                  >
                    + Add New
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="rounded-2xl bg-white/60 border border-white p-6 text-center">
                    <p className="text-sm text-gray-600">
                      You haven't saved a delivery address yet.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate("/Addaddress")}
                      className="mt-5 px-6 py-3 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition"
                    >
                      Add Delivery Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => {
                      const isSelected = selectedAddressId === address._id;

                      return (
                        <button
                          type="button"
                          key={address._id}
                          onClick={() => {
                            setSelectedAddressId(address._id);
                          }}
                          className={`w-full text-left rounded-2xl p-5 border transition ${
                            isSelected
                              ? "border-black bg-white/80"
                              : "border-white bg-white/40 hover:bg-white/70"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? "border-black" : "border-gray-400"
                              }`}
                            >
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-black" />
                              )}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-medium">
                                  {address.fullName}
                                </h3>

                                {address.isDefault && (
                                  <span className="px-2 py-1 rounded-full bg-[#e5e0d5] text-[9px] uppercase tracking-wider">
                                    Default
                                  </span>
                                )}
                              </div>

                              <p className="text-sm text-gray-600 mt-2 leading-6">
                                {address.addressLine}
                                {address.landmark
                                  ? `, Near ${address.landmark}`
                                  : ""}
                                <br />
                                {address.city}, {address.state} -{" "}
                                {address.pincode}
                                <br />
                                {address.country}
                              </p>

                              <p className="text-xs text-gray-500 mt-2">
                                {address.phone}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Payment Method */}
              {/* Payment Method Section inside your return() statement */}
              <section className="rounded-[2rem] bg-white/50 backdrop-blur-xl border border-white/70 p-6 md:p-9">
                <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                  Payment
                </p>
                <h2 className="text-2xl font-light mt-2">
                  Payment <span className="italic">method.</span>
                </h2>

                <div className="mt-6 space-y-4">
                  {/* Option 1: Cash on Delivery */}
                  <label className={`cursor-pointer rounded-2xl bg-white/70 border p-5 flex items-center gap-4 transition ${paymentMethod === "COD" ? "border-black" : "border-white"}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="COD" 
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="hidden" 
                    />
                    <div className="w-11 h-11 rounded-xl bg-[#f5f5f0] flex items-center justify-center">
                      <span className="text-lg">📦</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Cash on Delivery</p>
                      <p className="text-xs text-gray-500 mt-1">Pay when your order arrives.</p>
                    </div>
                    <div className={`ml-auto w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "COD" ? "border-black" : "border-gray-400"}`}>
                      {paymentMethod === "COD" && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                  </label>

                  {/* Option 2: Pay Online (Razorpay) */}
                  <label className={`cursor-pointer rounded-2xl bg-white/70 border p-5 flex items-center gap-4 transition ${paymentMethod === "ONLINE" ? "border-black" : "border-white"}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="ONLINE" 
                      checked={paymentMethod === "ONLINE"}
                      onChange={() => setPaymentMethod("ONLINE")}
                      className="hidden" 
                    />
                    <div className="w-11 h-11 rounded-xl bg-[#f5f5f0] flex items-center justify-center">
                      <span className="text-lg">💳</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Pay Online</p>
                      <p className="text-xs text-gray-500 mt-1">Cards, UPI, NetBanking via Razorpay.</p>
                    </div>
                    <div className={`ml-auto w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "ONLINE" ? "border-black" : "border-gray-400"}`}>
                      {paymentMethod === "ONLINE" && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                  </label>
                </div>
              </section>
            </div>

            {/* Right column: Order Summary */}
            <aside
              className="lg:sticky lg:top-8 rounded-[2rem]
              bg-white/60 backdrop-blur-xl border border-white/80
              shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 md:p-9"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                The final details
              </p>

              <h2 className="text-3xl font-light mt-3">
                Order <span className="italic">summary.</span>
              </h2>

              <div className="mt-8 space-y-5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Shipping</span>

                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-700">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                <div className="border-t border-black/10 pt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">Total</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Inclusive of applicable charges
                    </p>
                  </div>

                  <p className="text-xl font-medium">{formatPrice(total)}</p>
                </div>
              </div>

              {subtotal > 0 && subtotal < FREE_SHIPPING_LIMIT && (
                <div className="mt-6 rounded-2xl bg-[#f5f5f0] p-4">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Add{" "}
                    <span className="font-medium">
                      {formatPrice(FREE_SHIPPING_LIMIT - subtotal)}
                    </span>{" "}
                    more to unlock free shipping.
                  </p>

                  <div className="h-1.5 rounded-full bg-white mt-3 overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full"
                      style={{
                        width: `${Math.min(
                          (subtotal / FREE_SHIPPING_LIMIT) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading || cartItems.length === 0}
                className="w-full mt-8 px-6 py-4 rounded-full bg-black text-white
                text-sm tracking-wide hover:bg-gray-800 active:scale-[0.98]
                transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Place Order →"}
              </button>

              <div className="flex items-center justify-center gap-2 mt-5 text-xs text-gray-500">
                <span>♧</span>
                <span>Thoughtfully selected. Carefully delivered.</span>
              </div>

              <button
                type="button"
                onClick={() => navigate("/Home")}
                className="w-full mt-5 text-sm text-gray-500 hover:text-black transition"
              >
                Continue Shopping
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default Checkout;