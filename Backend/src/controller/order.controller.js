const Order = require('../model/order.model'); 
const OrderItem = require('../model/OrderItem'); 
const Cart = require('../model/cart.model'); 
const Razorpay = require('razorpay')
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZOR_PAY_API_KEY,
  key_secret: process.env.RAZOR_PAY_SECRET_KEY,
});


//  Initialize Razorpay Payment
//  Calculates total from cart and generates Razorpay order_id
 
const initiateRazorpayPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    let subtotal = 0;
    for (const item of cart.items) {
      subtotal += item.product.price * item.quantity;
    }
    
  
    const SHIPPING_FEE = 99;
    const FREE_SHIPPING_LIMIT = 599;
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    const options = {
      amount: total * 100, 
      currency: "INR",
      receipt: `receipt_order_${userId}_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      shippingAddressId, 
      paymentMethod, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    //VERIFY RAZORPAY SIGNATURE 
    if (paymentMethod === 'ONLINE') {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZOR_PAY_SECRET_KEY)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment verification failed." });
      }
    }

    let subtotal = 0;
    const orderItemIds = [];

    for (const item of cart.items) {
      const itemPrice = item.product.price; 
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      const newOrderItem = new OrderItem({
        product: item.product._id,
        quantity: item.quantity,
        price: itemPrice,
        total: itemTotal,
        userId: userId,
        status: 'Ordered',
        size:item.size
      });

      const savedOrderItem = await newOrderItem.save();
      orderItemIds.push(savedOrderItem._id);
    }

    const SHIPPING_FEE = 99;
    const FREE_SHIPPING_LIMIT = 599;
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    const newOrder = new Order({
      user: userId,
      OrderItems: orderItemIds, 
      ShippingAddress: shippingAddressId,
      paymentDetail: {
        paymentmethod: paymentMethod, // 'COD' or 'ONLINE'
        transactionId: razorpay_payment_id || "N/A",
        PaymentStatus: paymentMethod === 'ONLINE' ? 'Success' : 'Pending'
      },
      totalPrice: total,
      orderStatus: 'Pending'
    });

    const savedOrder = await newOrder.save();

    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, message: "Order placed successfully", data: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getOrderHistory = async (req, res) => {
  try {
    const userId =req.user._id; // Extracted from your 'b' token middleware

    // Find all orders belonging to this user
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'OrderItems', // 1st Level: Populate the OrderItem model
        populate: {
          path: 'product',  // 2nd Level: Populate the Product model inside OrderItem
          // Optional: You can select specific fields to send to the frontend to keep the payload light
          // select: 'name image price description' 
        }
      })
      .populate('ShippingAddress') // Populate the address details
      .sort({ CreatedAt: -1 }); // Sort by newest order first

    if (!orders || orders.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: "You have no order history.", 
        data: [] 
      });
    }

    res.status(200).json({ 
      success: true, 
      totalOrders: orders.length,
      data: orders 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user._id; // From token
    const { orderId } = req.params;

    // Filter by BOTH orderId and userId to ensure they own it
    const order = await Order.findOne({ _id: orderId, user: userId });
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found or unauthorized" });
    }

    // Prevent cancellation if the order is already on the way
    if (['Packed', 'Shipped', 'Out of Delivery', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: `Cannot cancel order. Current status: ${order.orderStatus}` });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    // Cascade the cancellation to the individual items
    await OrderItem.updateMany({ _id: { $in: order.OrderItems } }, { status: 'Cancelled' });

    res.status(200).json({ success: true, message: "Order cancelled successfully", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const refundOrReturnOrder = async (req, res) => {
  try {
    const userId = req.user._id; // From token
    const { orderId } = req.params;
    const { action } = req.body; // Expects "Return" or "Refund" from the frontend

    const order = await Order.findOne({ _id: orderId, user: userId });
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found or unauthorized" });
    }

    // You generally only refund/return after it's been delivered
    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ success: false, message: "Only delivered orders can be returned or refunded" });
    }

    const newStatus = action === 'Return' ? 'Returned' : 'Refunded';
    order.orderStatus = newStatus;
    await order.save();
    
    await OrderItem.updateMany({ _id: { $in: order.OrderItems } }, { status: newStatus });

    res.status(200).json({ success: true, message: `Order successfully marked as ${newStatus}`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; // 'Packed', 'Shipped', 'Out of Delivery', 'Delivered'

    const validStatuses = ['Pending', 'Packed', 'Shipped', 'Out of Delivery', 'Delivered', 'Cancelled', 'Refunded', 'Returned'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { returnDocument: "after"  });
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Keep individual items in sync with the parent order status
    await OrderItem.updateMany({ _id: { $in: order.OrderItems } }, { status: status });

    res.status(200).json({ success: true, message: "Order status updated successfully", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email') // Adjust fields based on your User model
      .populate({
        path: 'OrderItems',
        populate: {
          path: 'product' // Populates the actual product details inside the OrderItems
        }
      })
      .populate('ShippingAddress')
      .sort({ CreatedAt: -1 }); // Sort by newest first

    res.status(200).json({ 
      success: true, 
      totalOrders: orders.length,
      data: orders 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderHistory,
  cancelOrder,
  refundOrReturnOrder,
  updateOrderStatus,
  getAllOrders,
  initiateRazorpayPayment
};