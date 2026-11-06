import { Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import About from "./pages/About";
import MaleProduct from "./pages/Product/MaleProduct";
import WomanProduct from "./pages/Product/WomanProduct";

import Cart from "./components/cart/cart";
import AdminHome from "./pages/Admin/pages/AdminHome";
import AdminProduct from "./pages/Admin/pages/AdminProducts";
import ProductDetail from "./pages/Product/ProductDetail";
import { CartProvider } from "./context/CartContext";
import Addaddress from "./pages/user/Addaddress";
import ViewOrders from "./pages/user/ViewOrders";
import RefundOrders from "./pages/user/RefundOrders";
import Checkout from "./pages/user/Checkout";
import ProtectedRoute from "./ProtectedRoute";
import Orders from "./pages/Admin/pages/orders";
import Sales from "./pages/Admin/pages/sales";
const App = () => {
  return (
    <CartProvider>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoute allowedRole="user" />}>
          <Route path="/Home" element={<Home />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/About" element={<About />} />
          <Route path="/MaleProduct" element={<MaleProduct />} />
          <Route path="/WomanProduct" element={<WomanProduct />} />
          <Route path="/ProductDetails/:id" element={<ProductDetail />} />
          <Route path="/Cart" element={<Cart />} />
          <Route path="/AddAddress" element={<Addaddress />} />
          <Route path="/ViewOrders" element={<ViewOrders />} />
          <Route path="/RefundOrders" element={<RefundOrders />} />
          <Route path="/Checkout" element={<Checkout />} />
        </Route>
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/products" element={<AdminProduct />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/sales" element={< Sales/>} />
        </Route>
      </Routes>
    </CartProvider>
  );
};

export default App;
