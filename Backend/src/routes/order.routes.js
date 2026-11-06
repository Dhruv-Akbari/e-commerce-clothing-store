const express = require('express');
const orederRoutes = require('../controller/order.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');


const router = express.Router(); 

router.post('/create', verifyToken, orederRoutes.createOrder);


router.get('/history', verifyToken, orederRoutes.getOrderHistory); 

router.patch('/:orderId/cancel', verifyToken, orederRoutes.cancelOrder);
router.patch('/:orderId/refund-return', verifyToken, orederRoutes.refundOrReturnOrder);
router.get('/admin/all', verifyToken, verifyAdmin, orederRoutes.getAllOrders);
router.patch('/admin/:orderId/status', verifyToken, verifyAdmin, orederRoutes.updateOrderStatus);
router.patch('/:orderId/refund-return', verifyToken, orederRoutes.refundOrReturnOrder);
router.post('/initiate-payment', verifyToken, orederRoutes.initiateRazorpayPayment);

module.exports = router;