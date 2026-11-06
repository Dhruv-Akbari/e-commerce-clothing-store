import { Plus, Minus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCartItems, updateCartItem, removeCartItem } from "../../api/api";
import useUserId from "../../context/useUserId";

const Cart = ({ isOpen, onClose, onUpdateQuantity }) => {
  const [CartData, setCartData] = useState([]);
  const userId = useUserId();

  const fetchCartData = async () => {
    try {
      if (!userId) return;
      const response = await getCartItems(userId);
      if (response?.success && response?.data?.items) {
        setCartData(response.data.items);
      } else {
        setCartData([]);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCartData();
    }
  });

  const Navigate = useNavigate();

  
  const total = CartData.reduce((sum, item) => {
    const price = Number(String(item.product?.price ?? 0).replace("$", ""));

    return sum + price * (item.quantity || 1);
  }, 0);

  const handleMinus = async (data) => {
    if (data.quantity <= 1) {
     return;
   }
    const currentQuantity = data.quantity || 1;
    const newQuantity = currentQuantity - 1;
    const itemId = data._id;

    onUpdateQuantity?.(newQuantity);

    try {
     
      await updateCartItem(userId, itemId, {
        quantity: newQuantity,
      });
      fetchCartData();
    } catch (error) {
      console.log("Failed to sync quantity with database", error);
      onUpdateQuantity?.(itemId, currentQuantity);
    }
  };

  const handlePlus = async (data) => {
    const currentQuantity = data.quantity || 1;
    const newQuantity = currentQuantity + 1;
    const itemId = data._id;

    onUpdateQuantity?.(newQuantity);

    try {

      await updateCartItem(userId, itemId, {
        quantity: newQuantity,
      });
      fetchCartData();
    } catch (error) {
      console.log("Failed to sync quantity with database", error);
      onUpdateQuantity?.(itemId, currentQuantity);
    }
  };

  const onRemoveItem = async (data) => {
    const itemId = data._id;
    

    try {
      await removeCartItem(userId, itemId);
      fetchCartData();
    } catch (error) {
      console.log(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="
          absolute
          inset-0
          bg-black/25
          backdrop-blur-sm
        "
      />

      {/* Cart Drawer */}
      <div
        className="
          absolute
          top-4
          right-4
          bottom-4
          w-[calc(100%-2rem)]
          sm:w-[420px]

          rounded-[2rem]

          bg-[#f5f5f0]/95
          backdrop-blur-2xl

          border
          border-white/80

          shadow-[0_25px_80px_rgba(0,0,0,0.20)]

          overflow-hidden

          flex
          flex-col

          animate-[cartSlideIn_0.3s_ease-out]
        "
      >
        {/* Header */}
        <div
          className="
            flex
            items-center
            justify-between
            px-6
            py-5
            border-b
            border-black/5
          "
        >
          <div>
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.3em]
                text-gray-400
              "
            >
              Your Selection
            </p>

            <h2
              className="
                text-2xl
                font-light
                mt-1
              "
            >
              Shopping <span className="italic">Cart.</span>
            </h2>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="
              w-10
              h-10
              rounded-full
              bg-white/70
              border
              border-white

              flex
              items-center
              justify-center

              text-lg

              hover:bg-black
              hover:text-white

              transition
            "
          >
            ×
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {CartData.length === 0 ? (
            /* Empty Cart */
            <div
              className="
                h-full
                flex
                flex-col
                items-center
                justify-center
                text-center
              "
            >
              <div
                className="
                  w-20
                  h-20
                  rounded-full
                  bg-white/70
                  border
                  border-white

                  flex
                  items-center
                  justify-center

                  text-3xl
                "
              >
                ♡
              </div>

              <h3
                className="
                  text-xl
                  font-light
                  mt-5
                "
              >
                Your cart is empty
              </h3>

              <p
                className="
                  text-sm
                  text-gray-500
                  mt-2
                  max-w-xs
                "
              >
                Looks like you haven't added anything yet.
              </p>
            </div>
          ) : (
            /* Products */
            <div className="space-y-4">
              {CartData.map((item) => (
                <div
                  key={item._id}
                  className="
                    flex
                    gap-4
                    p-3
                    rounded-[1.3rem]

                    bg-white/60
                    border
                    border-white/80
                  "
                >
                  {/* Image */}
                  <div
                    className="
                      w-24
                      h-28
                      rounded-[1rem]
                      overflow-hidden
                      bg-[#e9e7e0]
                      shrink-0
                    "
                  >
                    <img
                      src={item?.product?.Images?.[0]?.url}
                      alt={item.name}
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                    />
                  </div>

                  {/* Details */}
                  <div
                    className="
                      flex-1
                      py-1
                      min-w-0
                    "
                  >
                    <p
                      className="
                        text-[9px]
                        uppercase
                        tracking-[0.2em]
                        text-gray-400
                      "
                    >
                      {item.product.category}
                    </p>

                    <h3
                      className="
                        text-sm
                        font-medium
                        mt-1
                        truncate
                      "
                    >
                      {item.product.name}
                    </h3>

                    <p
                      className="
                        text-sm
                        font-medium
                        mt-2
                      "
                    >
                      ₹{item.product.price}
                    </p>

                    {/* Controls */}
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        mt-3
                      "
                    >
                      {/* Quantity */}
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <button
                          type="button"
                          onClick={() => handleMinus(item)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="
                            w-7
                            h-7
                            rounded-full
                            bg-white
                            border
                            border-gray-200

                            hover:bg-black
                            hover:text-white

                            transition

                            flex
                            items-center
                            justify-center
                          "
                        >
                          <Minus size={13} strokeWidth={1.8} />
                        </button>

                        <span
                          className="
                            text-xs
                            w-5
                            text-center
                          "
                        >
                          {item.quantity || 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => handlePlus(item)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="
                            w-7
                            h-7
                            rounded-full
                            bg-white
                            border
                            border-gray-200

                            hover:bg-black
                            hover:text-white

                            transition

                            flex
                            items-center
                            justify-center
                          "
                        >
                          <Plus size={13} strokeWidth={1.8} />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="
                          w-8
                          h-8
                          rounded-full

                          flex
                          items-center
                          justify-center

                          text-gray-400

                          hover:text-red-500
                          hover:bg-red-50

                          transition
                        "
                      >
                        <Trash2 size={15} strokeWidth={1.7} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout */}
        {CartData.length > 0 && (
          <div
            className="
              p-5
              border-t
              border-black/5
              bg-white/30
            "
          >
            <div
              className="
                flex
                justify-between
                items-center
              "
            >
              <span
                className="
                  text-sm
                  text-gray-500
                "
              >
                Subtotal
              </span>

              <span
                className="
                  text-lg
                  font-medium
                "
              >
                ₹{total.toFixed(2)}
              </span>
            </div>

            <p
              className="
                text-[11px]
                text-gray-400
                mt-2
              "
            >
              Shipping and taxes calculated at checkout.
            </p>

            <button
              type="button"
              onClick={() => Navigate("/Checkout")}
              className="
                w-full
                mt-5
                py-4
                rounded-full
                
                bg-black
                text-white
                text-sm

                hover:bg-gray-800

                transition

                shadow-lg
              "
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
