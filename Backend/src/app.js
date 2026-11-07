const express = require("express");
const app = express();
app.set("trust proxy", 1);
const cookieparser = require("cookie-parser");
const Authrouter = require("./routes/auth.routes");
const cors = require("cors");
const Productrouter = require("./routes/product.route");
const Addressrouter = require("./routes/address.routes");
const Cartrouter = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const contactRoutes = require("./routes/contact.Routes");
const rateLimit = require('./middleware/rateLimiter')

app.use(
  cors({
    origin: [
        "http://localhost:5173",
        "https://e-commerce-clothing-store-frontend.onrender.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }),
);
app.use(express.json());
app.use(cookieparser());
app.use('/api',rateLimit)
app.use("/api/contact", contactRoutes);
app.use("/api/auth", Authrouter);
app.use("/api/product", Productrouter);
app.use("/api/Address", Addressrouter);
app.use("/api/cart", Cartrouter);
app.use('/api/orders', orderRoutes);

module.exports = app;
