import { getAllOrders } from "../../../api/api";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../Adminnavbar";
import { useState,useEffect } from "react";

const AdminHome = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Revenue",
      value: "$24,580",
      change: "+12.8%",
      description: "Compared to last month",
      icon: "$",
    },
    {
      title: "Total Orders",
      value: "1,284",
      change: "+8.2%",
      description: "Orders received",
      icon: "↗",
    },
    {
      title: "Products",
      value: "156",
      change: "12 new",
      description: "Items in your catalog",
      icon: "◇",
    },
    {
      title: "Customers",
      value: "892",
      change: "+18.4%",
      description: "Total customers",
      icon: "○",
    },
  ];

  const sections = [
    {
      title: "Products",
      description: "Manage your collection, prices, and inventory.",
      path: "/admin/products",
      number: "01",
      icon: "◇",
    },
    {
      title: "Orders",
      description: "Review purchases and update order status.",
      path: "/admin/orders",
      number: "02",
      icon: "↗",
    },
    {
      title: "Sales",
      description: "Track revenue and understand your performance.",
      path: "/admin/sales",
      number: "03",
      icon: "⌁",
    },
  ];


// Total Orders
const getTotalOrders = () => {
  return orders.length;
};

// Total Revenue 
const getTotalRevenue = () => {
  return orders.reduce((total, order) => {
    const deliveredRevenue = order.OrderItems.reduce((sum, item) => {
      if (item.status === "Delivered") {
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);

    return total + deliveredRevenue;
  }, 0);
};
  const [orders, setOrders] = useState([]);


  const fetchOrders = async () => {
    try {
      
      const res = await getAllOrders();
    
      
      setOrders((res.data || []).slice(0, 4));
    } catch (error) {
      console.error("Failed to fetch admin orders:", error);
    } 
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50  text-[#171717]">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-5 md:px-10 pt-10 pb-20">
        {/* Welcome Hero */}
        <section
          className="relative overflow-hidden rounded-[2rem]
          bg-white/50 backdrop-blur-xl border border-white/70
          shadow-[0_20px_60px_rgba(0,0,0,0.06)]
          p-8 md:p-14"
        >
          <div
            className="absolute -top-28 -right-20 w-80 h-80
            rounded-full bg-[#d8c3a5]/40 blur-3xl"
          />

          <div
            className="absolute -bottom-36 left-1/3 w-72 h-72
            rounded-full bg-[#c9d8d1]/50 blur-3xl"
          />

          <div className="relative z-10 flex flex-col md:flex-row
            md:items-center justify-between gap-8"
          >
            <div className="max-w-2xl">
              <span
                className="inline-block px-4 py-2 mb-6 rounded-full
                bg-white/60 backdrop-blur-md border border-white
                text-[10px] tracking-[0.25em] uppercase text-gray-600"
              >
                Administration · 2026
              </span>

              <h1
                className="text-4xl md:text-6xl font-light
                leading-tight tracking-tight"
              >
                Welcome to your
                <span className="block font-medium italic">
                  creative space.
                </span>
              </h1>

              <p className="mt-5 text-gray-600 leading-relaxed max-w-lg">
                Manage your store, organize your collections, and keep track
                of every order — all from one place.
              </p>

              <button
                onClick={() => navigate("/admin/products")}
                className="mt-8 px-7 py-4 rounded-full bg-black text-white
                text-sm hover:bg-gray-800 transition"
              >
                Manage Collection <span className="ml-2">↗</span>
              </button>
            </div>

            <div
              className="hidden md:flex w-40 h-40 lg:w-48 lg:h-48
              shrink-0 rounded-full bg-white/40 backdrop-blur-xl
              border border-white/80 shadow-xl
              items-center justify-center"
            >
              <div
                className="w-32 h-32 lg:w-40 lg:h-40 rounded-full
                border border-black/10 flex items-center justify-center"
              >
                <span className="text-5xl font-light italic">A.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Store overview
              </p>
              <h2 className="text-3xl md:text-4xl font-light mt-3">
                Your numbers<span className="italic">.</span>
              </h2>
            </div>
          </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

  {/* Total Orders */}
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <p className="text-sm text-gray-500 font-medium">
      Total Orders
    </p>

    <h2 className="text-3xl font-bold text-gray-800 mt-2">
      {getTotalOrders()}
    </h2>

    <p className="text-xs text-gray-400 mt-2">
      All orders received
    </p>
  </div>

  {/* Total Revenue */}
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <p className="text-sm text-gray-500 font-medium">
      Total Revenue
    </p>

    <h2 className="text-3xl font-bold text-green-600 mt-2">
      ₹{getTotalRevenue().toLocaleString("en-IN")}
    </h2>

    <p className="text-xs text-gray-400 mt-2">
      Revenue from delivered items only
    </p>
  </div>

</div>
        </section>

        {/* Management Sections */}
        <section className="mt-16">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
              Workspace
            </p>
            <h2 className="text-3xl md:text-4xl font-light mt-3">
              Manage your <span className="italic">store.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {sections.map((section) => (
              <button
                key={section.title}
                onClick={() => navigate(section.path)}
                className="group text-left relative overflow-hidden
                min-h-[230px] p-7 rounded-[1.75rem]
                bg-white/60 backdrop-blur-xl border border-white/80
                shadow-[0_10px_30px_rgba(0,0,0,0.03)]
                hover:shadow-xl hover:-translate-y-1
                transition duration-300"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs tracking-[0.2em] text-gray-400">
                    {section.number}
                  </span>

                  <span
                    className="w-11 h-11 rounded-full bg-white
                    border border-gray-100 flex items-center
                    justify-center text-xl group-hover:bg-black
                    group-hover:text-white transition"
                  >
                    {section.icon}
                  </span>
                </div>

                <h3 className="text-2xl font-medium mt-8">
                  {section.title}
                </h3>

                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                  {section.description}
                </p>

                <div className="absolute bottom-7 right-7 text-lg
                  group-hover:translate-x-1 transition"
                >
                  →
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Orders */}
        <section className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end
            justify-between gap-4 mb-8"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Latest activity
              </p>
              <h2 className="text-3xl md:text-4xl font-light mt-3">
                Recent <span className="italic">orders.</span>
              </h2>
            </div>

            <button
              onClick={() => navigate("/admin/orders")}
              className="px-5 py-3 rounded-full bg-white/70
              border border-white text-sm hover:bg-black
              hover:text-white transition"
            >
              View all orders →
            </button>
          </div>

          <div
            className="overflow-x-auto rounded-[1.5rem]
            bg-white/60 backdrop-blur-xl border border-white/80
            shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
          >
             <table className="w-full min-w-[850px] text-left text-sm whitespace-nowrap">

              <thead>
                <tr className="border-b border-black/10">
                  <th className="px-5 md:px-8 py-5 font-medium text-gray-500">
                    Order ID
                  </th>

                  <th className="px-5 md:px-8 py-5 font-medium text-gray-500">
                    Date
                  </th>

                  <th className="px-5 md:px-8 py-5 font-medium text-gray-500">
                    Items
                  </th>

                  <th className="px-5 md:px-8 py-5 font-medium text-gray-500">
                    Image
                  </th>

                  <th className="px-5 md:px-8 py-5 font-medium text-gray-500">
                    Size
                  </th>

                  <th className="px-5 md:px-8 py-5 font-medium text-gray-500">
                    Total
                  </th>

                  <th className="px-5 md:px-8 py-5 font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/5">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-white/40 transition"
                  >
                    <td className="px-5 md:px-8 py-5 font-medium">
                      {order._id.slice(-10).toUpperCase()}
                    </td>

                    <td className="px-5 md:px-8 py-5 text-gray-600">
                      {new Date(order.CreatedAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 md:px-8 py-5 text-gray-600">
                      {order.OrderItems?.length || 0} items
                    </td>

                    {/* Image column */}
                    <td className="px-5 md:px-8 py-5">
                      <div className="flex gap-2 max-w-40 overflow-x-auto">
                        {order.OrderItems?.map((item) => (
                          <img
                            key={item._id}
                            src={item.product?.Images?.[0]?.url}
                            alt="Product"
                            className="w-12 h-12 min-w-12 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    </td>

                    {/* Size column */}
                    <td className="px-5 md:px-8 py-5 font-medium">
                      <div className="flex flex-col gap-1">
                        {order.OrderItems?.map((item) => (
                          <span key={item._id}>{item.size}</span>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 md:px-8 py-5 font-medium">
                      {order.totalPrice}
                    </td>

                    <td className="px-5 md:px-8 py-5">
                      {
                        <span className="text-xs font-medium text-gray-600">
                          {order.orderStatus}
                        </span>
                     }
                        
                      
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </section>

        {/* Bottom Banner */}
        <section className="mt-12 p-8 md:p-10 rounded-[1.75rem]
          bg-[#e9e5dc] border border-white/70"
        >
          <div className="flex flex-col md:flex-row md:items-center
            justify-between gap-5"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Keep creating
              </p>
              <h3 className="text-2xl md:text-3xl font-light mt-3">
                Every detail tells <span className="italic">a story.</span>
              </h3>
              <p className="text-sm text-gray-500 mt-3">
                Keep your collection fresh and your customers inspired.
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/products")}
              className="shrink-0 px-7 py-4 rounded-full bg-black
              text-white text-sm hover:bg-gray-800 transition"
            >
              Explore Products →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminHome;