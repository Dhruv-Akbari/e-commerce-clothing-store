import { useEffect, useState } from "react";
import { getOrderHistory, cancelOrder, refundOrReturnOrder } from "../../api/api";
import Navbar from "../../components/navbar"; 

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

 

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrderHistory();
      
      
      setOrders(res.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
    fetchOrders();
  }, []);
  const handleCancel = async (orderId) => {
    try {
      setActionLoading(orderId);
      await cancelOrder(orderId);
      // Update local state to reflect cancellation
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: "Cancelled" } : o))
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setActionLoading(null);
    }
  };


  const handleRefundReturn = async (orderId, action) => {
    try {
      setActionLoading(orderId);
      await refundOrReturnOrder(orderId, action);
      const newStatus = action === "Return" ? "Returned" : "Refunded";
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (error) {
      alert(error.response?.data?.message || `Failed to process ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Packed": case "Shipped": return "bg-blue-100 text-blue-800";
      case "Out of Delivery": return "bg-orange-100 text-orange-800";
      case "Delivered": return "bg-green-100 text-green-800";
      case "Cancelled": case "Refunded": case "Returned": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getItemName = (item) =>
    item.product?.name ?? item.product?.title ?? item.product?.productName ?? "Product";

  const getItemImage = (item) =>
    item.product?.Image ??
    item.product?.image ??
    item.product?.url ??
    item.product?.Images?.[0]?.url ??
    item.product?.images?.[0]?.url ??
    item.product?.thumbnail ??
    "";

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#171717]">
      <Navbar />
      <main className="px-5 md:px-12 lg:px-20 py-10 md:py-14 max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Your History</p>
        <h1 className="text-4xl md:text-5xl font-light mt-3 tracking-tight mb-10">
          My <span className="italic">orders.</span>
        </h1>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <section className="rounded-[2rem] bg-white/50 backdrop-blur-xl border border-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-16 text-center">
            <h2 className="text-2xl font-light">No orders yet.</h2>
            <p className="text-gray-500 mt-4">Looks like you haven't made a purchase yet.</p>
          </section>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <section
                key={order._id}
                className="rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.04)] p-6 md:p-9"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5 mb-5">
                  <div>
                    <p className="text-xs text-gray-500">Order #{order._id}</p>
                    <p className="text-sm font-medium mt-1">
                      {new Date(order.CreatedAt).toLocaleDateString("en-IN", {
                        year: "numeric", month: "long", day: "numeric"
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                    <p className="text-xl font-light">{formatPrice(order.totalPrice)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.OrderItems?.map((item) => {
                    const imageUrl = getItemImage(item);
                    const productName = getItemName(item);

                    return (
                      <div key={item._id} className="flex gap-4">
                        <div className="w-20 h-24 shrink-0 rounded-2xl overflow-hidden bg-white/70">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[10px] text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 py-1">
                          <h3 className="font-medium text-sm break-words">
                            {productName}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium mt-2">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3 pt-5 border-t border-black/5">
                  {['Pending', 'Packed'].includes(order.orderStatus) && (
                    <button
                      onClick={() => handleCancel(order._id)}
                      disabled={actionLoading === order._id}
                      className="px-6 py-2 rounded-full border border-black/20 text-sm hover:bg-black hover:text-white transition disabled:opacity-50"
                    >
                      {actionLoading === order._id ? "Processing..." : "Cancel Order"}
                    </button>
                  )}

                  {order.orderStatus === 'Delivered' && (
                    <>
                      <button
                        onClick={() => handleRefundReturn(order._id, 'Return')}
                        disabled={actionLoading === order._id}
                        className="px-6 py-2 rounded-full border border-black/20 text-sm hover:bg-black hover:text-white transition disabled:opacity-50"
                      >
                        Return Order
                      </button>
                      <button
                        onClick={() => handleRefundReturn(order._id, 'Refund')}
                        disabled={actionLoading === order._id}
                        className="px-6 py-2 rounded-full border border-black/20 text-sm hover:bg-black hover:text-white transition disabled:opacity-50"
                      >
                        Request Refund
                      </button>
                    </>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewOrders;