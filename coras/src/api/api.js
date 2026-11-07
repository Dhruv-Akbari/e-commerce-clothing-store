import axios, { AxiosError } from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Automatically attach the token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Automatically handle invalid/expired token
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 500 || error.response?.status === 401) {
      try {
        await API.post("/auth/logout");
      } catch (logoutError) {
        console.log("Logout API error:", logoutError);
      }

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("user");

      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);

export const Register = async (data) => {
  const response = await API.post("/auth/Register", data);
  return response.data;
};

export const Login = async (data) => {
  const response = await API.post("/auth/Login", data);

  
  localStorage.setItem("user", JSON.stringify(response.data.Data));
    window.dispatchEvent(new Event("userUpdated"));
  return response.data;
};

export const Logout = async () => {
  const response = await API.post("/auth/Logout");
  return response.data;
};

export const GetAllProducts = async () => {
  const response = await API.get("/product/getall");
  return response.data;
};

export const AddProduct = async (productData) => {
  try {
    const response = await API.post("/product/add", productData);
    return response.data;
  } catch (error) {
    console.error(
      "Error adding product:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const UpdateProduct = async (id, productData) => {
  try {
    const response = await API.put(`/product/update/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating product:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const DeleteProduct = async (id, productData) => {
  try {
    const response = await API.delete(`/product/delete/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting product:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getUserAddresses = async (userId) => {
  try {
    const response = await API.get(`/Address/GetAddress/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw error;
  }
};

export const AddAddress = async (addressData) => {
  try {
    const response = await API.post("/Address/AddAddress", addressData);
    return response.data;
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
};

export const updateAddressAPI = async (id, addressData) => {
  try {
    const response = await API.put(`/Address/UpdateAddress/${id}`, addressData);
    return response.data;
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

export const deleteAddressAPI = async (id) => {
  try {
    const response = await API.delete(`/Address/DeleteAddress/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};

export const addCart = async (userId, productData) => {
  try {
    const response = await API.post(`/cart/AddToCart/${userId}`, productData);

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getCartItems = async (userId) => {
  try {
    const response = await API.get(`/cart/GetCart/${userId}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateCartItem = async (userId, itemId, productData) => {
  try {
    const response = await API.patch(
      `/cart/CartUpdate/${userId}/${itemId}`,
      productData,
    );
    return response.data;
  } catch (error) {
    console.error("Cart update failed:", error);
    throw error;
  }
};

export const removeCartItem = async (userId, itemId) => {
  try {
    const response = await API.delete(`/cart/CartDelete/${userId}/${itemId}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Creates a new order using items currently in the user's cart
 * @param {Object} orderData - { shippingAddressId, paymentMethod, transactionId, paymentId }
 */
export const createOrder = async (orderData) => {
  const response = await API.post("/orders/create", orderData);
  return response.data;
};

// Fetches the logged-in user's order history with product details and images

export const getOrderHistory = async () => {
  const response = await API.get("/orders/history");
  return response.data;
};

/**
 * Cancels a specific order (only if it hasn't shipped yet)
 * @param {String} orderId - The ID of the order to cancel
 */
export const cancelOrder = async (orderId) => {
  const response = await API.patch(`/orders/${orderId}/cancel`);
  return response.data;
};

/**
 * Requests a return or refund for a delivered order
 * @param {String} orderId - The ID of the order
 * @param {String} action - Must be exactly "Return" or "Refund"
 */
export const refundOrReturnOrder = async (orderId, action) => {
  const response = await API.patch(`/orders/${orderId}/refund-return`, {
    action,
  });
  return response.data;
};

// Fetches every order in the database for the admin dashboard

export const getAllOrders = async () => {
  const response = await API.get("/orders/admin/all");
  return response.data;
};

/**
 * Updates the logistics status of an order
 * @param {String} orderId - The ID of the order
 * @param {String} status - 'Packed', 'Shipped', 'Out of Delivery', 'Delivered', etc.
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await API.patch(`/orders/admin/${orderId}/status`, {
    status,
  });
  return response.data;
};

// Remove the old initiatePayment and replace it with this:
export const initiatePayment = async () => {
  // Use your custom 'API' instance so it automatically attaches the token and base URL
  const response = await API.post("/orders/initiate-payment");
  return response.data;
};
