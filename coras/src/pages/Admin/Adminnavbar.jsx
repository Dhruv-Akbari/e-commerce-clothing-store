import React from "react";
import { NavLink,useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import axios from "axios";


const AdminNavbar = () => {
  const navItems = [
    { name: "Home", path: "/admin" },
    { name: "Products", path: "/admin/products" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Sales", path: "/admin/sales" },
  ];
  const navigate=useNavigate()
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
  return (
    <header className="sticky top-0 z-50 px-4 md:px-10 pt-4">
      <nav
        className="max-w-7xl mx-auto flex items-center justify-between
        gap-4 px-5 md:px-8 py-4 rounded-2xl
        bg-white/70 backdrop-blur-xl
        border border-white/80
        shadow-[0_8px_30px_rgba(0,0,0,0.05)]"
      >
        {/* Logo */}
        <NavLink to="/admin" className="shrink-0">
          <span className="text-xl md:text-2xl font-semibold tracking-tight">
            CORAS<span className="font-light italic">.</span>
          </span>
          <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500">
            Admin Studio
          </p>
        </NavLink>

        {/* Navigation */}
        <div className="flex items-center gap-1 md:gap-3 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `px-3 md:px-5 py-2.5 rounded-full text-xs md:text-sm
                whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? "bg-black text-white shadow-md"
                    : "text-gray-600 hover:bg-white hover:text-black"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
          <button onClick={handelogout} className="px-2 py-3  text-gray-500 hover:text-red-600 active:scale-85 rounded-2xl">Logout</button>
        </div>
      </nav>
    </header>
  );
};

export default AdminNavbar;