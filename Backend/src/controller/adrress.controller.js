const Addressmodel = require("../model/address.model");

// Create Address
const addAddress = async (req, res) => {
  const userId = req.user._id;
  const {
    fullName,
    phone,
    email,
    addressLine,
    landmark,
    city,
    state,
    pincode,
    country,
  } = req.body;

  try {
    // Validation
    if (
      !fullName ||
      !phone ||
      !email ||
      !addressLine ||
      !landmark ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const addressPayload = {
      ...req.body,
      user: userId,
    };

    
    const address = await Addressmodel.create(addressPayload);

    return res.status(201).json({
      message: "Address added successfully",
      address: address,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get Address By ID
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.params.id;
    const addresses = await Addressmodel.find({ user: userId });
    return res.status(200).json({ addresses: addresses || [] });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getUserAddresses };

// Update Address
const updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;


    const updatedAddress = await Addressmodel.findByIdAndUpdate(
      addressId,
      req.body,
      { returnDocument: "after" , runValidators: true },
    );

    if (!updatedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    return res.status(200).json({
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Address
const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    const deletedAddress = await Addressmodel.findByIdAndDelete(addressId);

    if (!deletedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    return res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Export all controllers
module.exports = {
  addAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
};
