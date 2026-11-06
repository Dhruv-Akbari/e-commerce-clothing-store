const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
   required: true, 
  },
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  addressLine: { 
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String, 
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: "India",
  },
}, { timestamps: true });

module.exports = mongoose.model('Address', AddressSchema);