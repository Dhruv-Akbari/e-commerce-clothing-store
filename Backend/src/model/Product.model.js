const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    detail: {
      type: String,
      default:''
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    gender: { type: String },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: { type: Number, required: true, min: 0 },

    currency: {
      type: String,
      default: "INR",
      required: true,
    },

    sizes: {
      type: [String],
      required: true,
    },
    colors: {
      type: [String],
      required: true,
    },
    material: {
      type: String,
      required: true,
    },
    fit: {
      type: String,
      required: true,
    },
    sleeve: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },

    Images: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          fileId: {
            type: String,
            required: true,
          },
        },
      ],
      required: true,
      validate: {
        validator: (images) => images.length > 0,
        message: "At least one product image is required.",
      },
    },
  },
  { timestamps: true },
);

const Productmodel = mongoose.model("Product", ProductSchema);

module.exports = Productmodel;
