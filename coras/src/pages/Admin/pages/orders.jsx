
import { useEffect, useMemo, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../../../api/api";
import AdminNavbar from "../Adminnavbar";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(null);

  // Load More Pagination
  const [visibleCount, setVisibleCount] = useState(20);

  // Sorting
  const [sortBy, setSortBy] = useState("newest");

  const validStatuses = [
    "Pending",
    "Packed",
    "Shipped",
    "Out of Delivery",
    "Delivered",
    "Returned",
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders();
      setOrders(res.data || []);
    } catch (error) {
      console.error("Failed to fetch admin orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setStatusUpdating(orderId);

      await updateOrderStatus(orderId, newStatus);

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, orderStatus: newStatus }
            : order
        )
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status.");
    } finally {
      setStatusUpdating(null);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price || 0);

  // Sorting Logic
  const sortedOrders = useMemo(() => {
    const result = [...orders];

    switch (sortBy) {
      case "oldest":
        return result.sort(
          (a, b) =>
            new Date(a.CreatedAt).getTime() -
            new Date(b.CreatedAt).getTime()
        );

      case "highest":
        return result.sort(
          (a, b) => (b.totalPrice || 0) - (a.totalPrice || 0)
        );

      case "lowest":
        return result.sort(
          (a, b) => (a.totalPrice || 0) - (b.totalPrice || 0)
        );

      case "status":
        return result.sort((a, b) =>
          (a.orderStatus || "").localeCompare(b.orderStatus || "")
        );

      case "newest":
      default:
        return result.sort(
          (a, b) =>
            new Date(b.CreatedAt).getTime() -
            new Date(a.CreatedAt).getTime()
        );
    }
  }, [orders, sortBy]);

  const currentOrders = sortedOrders.slice(0, visibleCount);

  const getStatusStyle = (status) => {
    const styles = {
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      Packed: "bg-blue-50 text-blue-700 border-blue-200",
      Shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
      "Out of Delivery": "bg-purple-50 text-purple-700 border-purple-200",
      Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Returned: "bg-orange-50 text-orange-700 border-orange-200",
      Cancelled: "bg-red-50 text-red-700 border-red-200",
      Refunded: "bg-gray-100 text-gray-600 border-gray-200",
    };

    return styles[status] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  const deliveredCount = orders.filter(
    (order) => order.orderStatus === "Delivered"
  ).length;

  const pendingCount = orders.filter(
    (order) => order.orderStatus === "Pending"
  ).length;

  const returnedCount = orders.filter(
    (order) => order.orderStatus === "Returned"
  ).length;

  const isLocked = (status) =>
    ["Delivered", "Cancelled", "Refunded"].includes(status);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/50  text-[#171923]">
      <AdminNavbar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-9">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400">
                Administration / Orders
              </p>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
              Order <span className="font-light italic text-gray-400">Management</span>
            </h1>

            <p className="text-sm text-gray-400 mt-2">
              Track, manage and monitor your customer orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/70 backdrop-blur-xl border border-white shadow-sm text-sm font-medium hover:bg-white transition disabled:opacity-50"
            >
              <span className={loading ? "animate-spin" : ""}>↻</span>
              Refresh
            </button>

            <div className="px-5 py-3 rounded-xl bg-white/70 backdrop-blur-xl border border-white shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                Total Orders
              </p>
              <p className="text-xl font-semibold">{orders.length}</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="relative overflow-hidden rounded-2xl border border-white bg-white/60 backdrop-blur-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.035)]">
            <p className="text-xs text-gray-400 font-medium">Total Orders</p>
            <h2 className="text-3xl font-semibold mt-2">{orders.length}</h2>
            <div className="absolute -right-5 -bottom-8 w-24 h-24 rounded-full bg-blue-100/50 blur-2xl"></div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white bg-white/60 backdrop-blur-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.035)]">
            <p className="text-xs text-gray-400 font-medium">Pending Orders</p>
            <h2 className="text-3xl font-semibold mt-2">{pendingCount}</h2>
            <div className="absolute -right-5 -bottom-8 w-24 h-24 rounded-full bg-amber-100/60 blur-2xl"></div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white bg-white/60 backdrop-blur-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.035)]">
            <p className="text-xs text-gray-400 font-medium">Delivered Orders</p>
            <h2 className="text-3xl font-semibold mt-2">{deliveredCount}</h2>
            <div className="absolute -right-5 -bottom-8 w-24 h-24 rounded-full bg-emerald-100/60 blur-2xl"></div>
          </div>
        </div>

        {/* Orders Workspace */}
        <section className="rounded-3xl border border-white/90 bg-white/65 backdrop-blur-2xl shadow-[0_20px_70px_rgba(30,40,70,0.06)] overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-8 py-6 border-b border-gray-100/80">

            <div>
              <h2 className="text-lg font-semibold">All Orders</h2>
              <p className="text-xs text-gray-400 mt-1">
                Showing {currentOrders.length} of {orders.length} orders
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-400 whitespace-nowrap">
                Sort by
              </label>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setVisibleCount(20);
                }}
                className="outline-none bg-white/80 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium text-gray-700 cursor-pointer hover:border-gray-400 transition"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
                <option value="status">Order Status</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="w-9 h-9 border-[3px] border-gray-200 border-t-black rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400 mt-5">
                Loading orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-24 text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-semibold">No orders yet</h3>
              <p className="text-sm text-gray-400 mt-2">
                Customer orders will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Responsive Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100">
                      {[
                        "ORDER ID",
                        "DATE",
                        "ITEMS",
                        "PRODUCTS",
                        "SIZE",
                        "TOTAL",
                        "STATUS",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-6 py-5 text-[10px] tracking-[0.13em] font-semibold text-gray-400"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100/80">
                    {currentOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-white/80 transition-colors duration-200"
                      >
                        <td className="px-6 py-5">
                          <span className="text-xs font-semibold tracking-wide">
                            #{order._id.slice(-10).toUpperCase()}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-xs text-gray-500">
                          {new Date(order.CreatedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="px-6 py-5">
                          <span className="text-xs font-medium text-gray-600">
                            {order.OrderItems?.length || 0} items
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            {order.OrderItems?.slice(0, 3).map((item) => (
                              <img
                                key={item._id}
                                src={item.product?.Images?.[0]?.url}
                                alt="Product"
                                className="w-11 h-11 rounded-xl object-cover border border-gray-100 shadow-sm bg-gray-50"
                              />
                            ))}

                            {order.OrderItems?.length > 3 && (
                              <span className="text-[10px] text-gray-400">
                                +{order.OrderItems.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            {order.OrderItems?.map((item) => (
                              <span
                                key={item._id}
                                className="text-xs text-gray-500"
                              >
                                {item.size || "N/A"}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="text-sm font-semibold">
                            {formatPrice(order.totalPrice)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          {isLocked(order.orderStatus) ? (
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-[10px] font-semibold whitespace-nowrap ${getStatusStyle(order.orderStatus)}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {order.orderStatus}
                            </span>
                          ) : (
                            <div className="relative">
                              <select
                                value={order.orderStatus}
                                onChange={(e) =>
                                  handleStatusChange(order._id, e.target.value)
                                }
                                disabled={statusUpdating === order._id}
                                className={`appearance-none outline-none border rounded-full pl-4 pr-9 py-2.5 text-[10px] font-semibold cursor-pointer transition ${getStatusStyle(order.orderStatus)} ${
                                  statusUpdating === order._id
                                    ? "opacity-50 cursor-wait"
                                    : ""
                                }`}
                              >
                                {validStatuses.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>

                              {statusUpdating === order._id && (
                                <span className="absolute -right-5 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin"></span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Load More */}
              <div className="flex flex-col items-center justify-center gap-3 px-5 py-7 border-t border-gray-100/80 bg-white/30">

                {visibleCount < sortedOrders.length ? (
                  <>
                    <button
                      onClick={() =>
                        setVisibleCount((prev) => prev + 20)
                      }
                      className="group flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#171923] text-white text-xs font-semibold tracking-wide shadow-lg shadow-black/10 hover:bg-gray-700 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Load More Orders
                      <span className="text-base group-hover:translate-y-0.5 transition-transform">
                        ↓
                      </span>
                    </button>

                    <p className="text-[10px] text-gray-400">
                      {sortedOrders.length - visibleCount} more orders available
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">
                    You've reached the end of all orders.
                  </p>
                )}

              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Orders;
