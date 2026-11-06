const express = require("express");
const CartController = require("../controller/cart.controller");
const router = express();

router.get("/GetCart/:userId", CartController.getCart);
router.post("/AddToCart/:userId", CartController.addToCart);
router.patch("/CartUpdate/:userId/:itemId", CartController.updateCartItem);
router.delete("/CartDelete/:userId/:itemId", CartController.removeCartItem);
router.delete('/ClearCart/:id',CartController.clearCart);

module.exports=router