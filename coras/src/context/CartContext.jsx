import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { addCart as addCartAPI,getCartItems} from "../api/api";
import useUserId from "./useUserId";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cartItems");
      const parsed = savedCart ? JSON.parse(savedCart) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error loading cart:", error);
      return [];
    }
  });
  

  const userId = useUserId();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  


const cartCount = cartItems.reduce(
  (total, item) => total + (item.quantity || 1),
  0
);



  
  const addToCart = async (product, size, color) => {
    if (!userId) {
      throw new Error("Please log in before adding items to your cart.");
    }

    const productId = product._id || product.id;

    if (!productId) {
      throw new Error("Product ID is missing.");
    }

    const payload = {
      product: productId,
      quantity: 1,
      size,
      color,
    };

    setCartLoading(true);

    try {
      const response = await addCartAPI(userId, payload);
    
      
      
      if (!response?.success) {
        throw new Error(response?.message || "Could not add item to cart.");
      }

      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (item) =>
            String(item._id || item.id) === String(productId) &&
            item.size === size &&
            item.color === color
        );

        if (existingItem) {
          return prevItems.map((item) =>
            String(item._id || item.id) === String(productId) &&
            item.size === size &&
            item.color === color
              ? {
                  ...item,
                  quantity: (item.quantity || 1) + 1,
                }
              : item
          );
        }

        return [
          ...prevItems,
          {
            ...product,
            id: productId,
            quantity: 1,
            size,
            color,
          },
        ];
      });

      return response;
    } catch(error){
      console.log(error);
      
    }
  };



  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCartItems((items) =>
        items.filter(
          (item) => String(item._id || item.id) !== String(id)
        )
      );
      return;
    }

    setCartItems((items) =>
      items.map((item) =>
        String(item._id || item.id) === String(id)
          ? { ...item, quantity }
          : item
      )
    );
  };

  
  const removeItem = (id) => {
    setCartItems((items) =>
      items.filter(
        (item) => String(item._id || item.id) !== String(id)
      )
    );
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        isCartOpen,
        cartLoading,
        addToCart,
        updateQuantity,
        removeItem,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};

export default useCart;