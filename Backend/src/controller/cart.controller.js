const Cartmodel = require('../model/cart.model')


const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
  
    
    
    const cart = await Cartmodel.findOne({ user: userId }).populate("items.product");
    
    if (!cart) {
      return res.status(400).json('cart is empty')
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });

    
  }
};


 const addToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { product, quantity, size, color } = req.body;

    let cart = await Cartmodel.findOne({ user: userId });

if (!cart) {
  cart = new Cartmodel({
    user: userId,
    items: [{ product, quantity, size, color }],
  });

  await cart.save();

  return res.status(201).json({
    success: true,
    data: cart,
  });
}

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === product &&
        item.size === size &&
        item.color === color
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product, quantity, size, color });
    }

    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const updateCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const { quantity, size, color } = req.body;

    const cart = await Cartmodel.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    if (quantity !== undefined) item.quantity = quantity;
    if (size) item.size = size;
    if (color) item.color = color;

    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const removeCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    const cart = await Cartmodel.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { _id: itemId } } },
      { returnDocument: "after"  }
    );

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

  
    const cart = await Cartmodel.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } },
      { returnDocument: "after"  }
    );

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Cart cleared successfully for checkout",
      data: cart 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 

module.exports={clearCart,removeCartItem,updateCartItem,addToCart,getCart}