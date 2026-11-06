
import { useState, useEffect, useMemo } from "react";
import AdminNavbar from "../Adminnavbar";
import { getAllOrders } from "../../../api/api";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
];

const cardStyle =
  "bg-white/70 backdrop-blur-xl border border-white/90 shadow-[0_8px_35px_rgba(15,23,42,0.045)] rounded-3xl";

const chartGrid = "#eef0f6";

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.96)",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "12px 16px",
  boxShadow: "0 8px 25px rgba(0,0,0,0.07)",
};

const StatCard = ({ title, value, subtitle, icon, color, bg }) => (
  <div className={`${cardStyle} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-3 tracking-tight">
          {value}
        </h2>
      </div>

      <div className={`${bg} ${color} w-12 h-12 rounded-2xl flex items-center justify-center text-xl`}>
        {icon}
      </div>
    </div>

    <p className="text-xs text-slate-400 mt-4">{subtitle}</p>
  </div>
);

const ChartCard = ({ title, subtitle, children, className = "" }) => (
  <div className={`${cardStyle} p-5 sm:p-7 ${className}`}>
    <div className="mb-6">
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
    </div>
    {children}
  </div>
);

const Sales = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders();
      console.log(res);
      setOrders(res.data || []);
    } catch (error) {
      console.error("Failed to fetch admin orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Supports both API response object and data array
  const orderList = Array.isArray(orders)
    ? orders
    : orders?.data || [];

  const analytics = useMemo(() => {
    const totalOrders = orderList.length;

    let totalRevenue = 0;
    let totalDeliveredItems = 0;

    const statusMap = {};
    const revenueMap = {};
    const dailyOrdersMap = {};
    const productMap = {};
    const categoryMap = {};

    orderList.forEach((order) => {
      const status = order.orderStatus || "Unknown";

      statusMap[status] = (statusMap[status] || 0) + 1;

      const date = new Date(
        order.orderdate || order.CreatedAt
      );

      if (!isNaN(date.getTime())) {
        const dateKey = date.toISOString().slice(0, 10);

        dailyOrdersMap[dateKey] =
          (dailyOrdersMap[dateKey] || 0) + 1;
      }

      (order.OrderItems || []).forEach((item) => {
        // Only delivered items count as revenue
        if (item.status !== "Delivered") return;

        const revenue =
          Number(item.price || 0) *
          Number(item.quantity || 0);

        totalRevenue += revenue;
        totalDeliveredItems += Number(item.quantity || 0);

        if (!isNaN(date.getTime())) {
          const dateKey = date.toISOString().slice(0, 10);

          revenueMap[dateKey] =
            (revenueMap[dateKey] || 0) + revenue;
        }

        const productName =
          item.product?.name || "Unknown Product";

        if (!productMap[productName]) {
          productMap[productName] = {
            name: productName,
            quantity: 0,
            revenue: 0,
          };
        }

        productMap[productName].quantity +=
          Number(item.quantity || 0);

        productMap[productName].revenue += revenue;

        const category =
          item.product?.category || "Other";

        categoryMap[category] =
          (categoryMap[category] || 0) + revenue;
      });
    });

    const allDates = [
      ...new Set([
        ...Object.keys(revenueMap),
        ...Object.keys(dailyOrdersMap),
      ]),
    ].sort();

    const dailyData = allDates.map((date) => ({
      date: new Date(date + "T00:00:00").toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
        }
      ),
      revenue: revenueMap[date] || 0,
      orders: dailyOrdersMap[date] || 0,
    }));

    const statusData = Object.entries(statusMap).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    const productData = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const categoryData = Object.entries(categoryMap)
      .map(([name, revenue]) => ({
        name,
        revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalOrders,
      totalRevenue,
      totalDeliveredItems,
      statusData,
      dailyData,
      productData,
      categoryData,
    };
  }, [orderList]);

  const formatCurrency = (value) =>
    `₹${Number(value).toLocaleString("en-IN")}`;

  return (
    <>
      <AdminNavbar />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 px-4 sm:px-6 lg:px-8 py-8">

        <div className="max-w-[1600px] mx-auto space-y-8">

          {/* HEADER */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                  Business Analytics
                </p>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
                Sales Overview
              </h1>

              <p className="text-sm text-slate-400 mt-2">
                Track your store performance and sales insights.
              </p>
            </div>

            <div className={`${cardStyle} px-5 py-3 flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                📊
              </div>
              <div>
                <p className="text-xs text-slate-400">Dashboard</p>
                <p className="text-sm font-semibold text-slate-700">
                  Sales & Revenue
                </p>
              </div>
            </div>

          </div>

          {/* SUMMARY CARDS */}

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-700">
                Performance Summary
              </h2>
              <span className="text-xs text-slate-400">
                All time
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

              <StatCard
                title="Total Orders"
                value={analytics.totalOrders.toLocaleString("en-IN")}
                subtitle="All orders received"
                icon="📦"
                color="text-indigo-600"
                bg="bg-indigo-50"
              />

              <StatCard
                title="Total Revenue"
                value={formatCurrency(analytics.totalRevenue)}
                subtitle="Delivered items only"
                icon="₹"
                color="text-emerald-600"
                bg="bg-emerald-50"
              />

              <StatCard
                title="Items Delivered"
                value={analytics.totalDeliveredItems.toLocaleString("en-IN")}
                subtitle="Total delivered quantity"
                icon="✓"
                color="text-sky-600"
                bg="bg-sky-50"
              />

              <StatCard
                title="Average Order Value"
                value={formatCurrency(
                  analytics.totalOrders
                    ? analytics.totalRevenue / analytics.totalOrders
                    : 0
                )}
                subtitle="Delivered revenue / all orders"
                icon="↗"
                color="text-violet-600"
                bg="bg-violet-50"
              />

            </div>
          </section>

          {/* REVENUE CHART */}

          <ChartCard
            title="Revenue Overview"
            subtitle="Revenue generated from delivered items"
          >
            <div className="h-[280px] sm:h-[350px] w-full">

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.dailyData}
                  margin={{ top: 10, right: 10, left: 5, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#6366f1"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#6366f1"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="4 5"
                    vertical={false}
                    stroke={chartGrid}
                  />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />

                  <YAxis
                    tickFormatter={(value) => `₹${value}`}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={65}
                  />

                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [
                      formatCurrency(value),
                      "Revenue",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#revenueGradient)"
                    activeDot={{
                      r: 6,
                      strokeWidth: 3,
                      stroke: "#fff",
                    }}
                    animationDuration={1200}
                  />
                </AreaChart>
              </ResponsiveContainer>

            </div>
          </ChartCard>

          {/* ORDER STATUS + DAILY ORDERS */}

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* ORDER STATUS */}

            <ChartCard
              title="Order Status"
              subtitle="Distribution of all orders"
            >
              <div className="h-[290px] w-full">

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius="57%"
                      outerRadius="78%"
                      paddingAngle={5}
                      animationDuration={1000}
                      stroke="none"
                    >
                      {analytics.statusData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip contentStyle={tooltipStyle} />

                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "12px",
                        paddingTop: "15px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

              </div>
            </ChartCard>

            {/* DAILY ORDERS */}

            <ChartCard
              title="Daily Orders"
              subtitle="Number of orders received each day"
            >
              <div className="h-[290px] w-full">

                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.dailyData}
                    margin={{ top: 10, right: 5, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 5"
                      vertical={false}
                      stroke={chartGrid}
                    />

                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip contentStyle={tooltipStyle} />

                    <Bar
                      dataKey="orders"
                      name="Orders"
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={45}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>

              </div>
            </ChartCard>

          </section>

          {/* PRODUCT + CATEGORY PERFORMANCE */}

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* TOP PRODUCTS */}

            <ChartCard
              title="Top Selling Products"
              subtitle="Ranked by delivered quantity"
            >
              <div className="h-[310px] w-full">

                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.productData}
                    layout="vertical"
                    margin={{ left: 10, right: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 5"
                      horizontal={false}
                      stroke={chartGrid}
                    />

                    <XAxis
                      type="number"
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip contentStyle={tooltipStyle} />

                    <Bar
                      dataKey="quantity"
                      name="Delivered Quantity"
                      fill="#8b5cf6"
                      radius={[0, 8, 8, 0]}
                      barSize={24}
                      animationDuration={1200}
                    />
                  </BarChart>
                </ResponsiveContainer>

              </div>
            </ChartCard>

            {/* CATEGORY REVENUE */}

            <ChartCard
              title="Category Performance"
              subtitle="Revenue by product category"
            >
              <div className="h-[310px] w-full">

                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.categoryData}
                    margin={{ top: 10, right: 5, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 5"
                      vertical={false}
                      stroke={chartGrid}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />

                    <YAxis
                      tickFormatter={(value) => `₹${value}`}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      width={65}
                    />

                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [
                        formatCurrency(value),
                        "Revenue",
                      ]}
                    />

                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="#f59e0b"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={45}
                      animationDuration={1200}
                    />
                  </BarChart>
                </ResponsiveContainer>

              </div>
            </ChartCard>

          </section>

          {/* FOOTER */}

          <div className="text-center py-5">
            <p className="text-xs text-slate-400">
              Sales Analytics Dashboard · Business Performance
            </p>
          </div>

        </div>
      </main>
    </>
  );
};

export default Sales;
