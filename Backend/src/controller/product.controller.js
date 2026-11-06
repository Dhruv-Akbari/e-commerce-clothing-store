
const ProductModel = require('../model/Product.model');
const {
  uploadImage,
  deleteImage,
} = require("../services/storage.service");

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const PRODUCT_FIELDS = [
  "name",
  "detail",
  "description",
  "category",
  "gender",
  "price",
  "originalPrice",
  "currency",
  "sizes",
  "colors",
  "material",
  "fit",
  "sleeve",
  "rating",
  "isFeatured",
  "isNewArrival",
  "isBestSeller",
];

const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
};

const parseArray = (value) => {
  if (Array.isArray(value)) return value;

  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (typeof value !== "string") {
    return [];
  }

  // Handle JSON strings such as '["Black","Light Blue"]'
  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch (error){
    console.log(error);
    
  }

  return value.split(",").map((item) => item.trim()).filter(Boolean);
};

const getProductData = (body) => {

const getProductData = (body) => {
  const data = {};

  for (const field of PRODUCT_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  // Convert sizes and colors into arrays
  for (const field of ["sizes", "colors"]) {
    if (data[field] !== undefined) {
      data[field] = parseArray(data[field]);
    }
  }

  // Convert numeric fields
  for (const field of ["price", "originalPrice", "rating"]) {
    if (data[field] !== undefined && data[field] !== "") {
      data[field] = Number(data[field]);
    }
  }

  // Convert boolean fields
  for (const field of [
    "isFeatured",
    "isNewArrival",
    "isBestSeller",
  ]) {
    if (data[field] !== undefined) {
      data[field] = parseBoolean(data[field]);
    }
  }

  return data;
};

};

const validateFiles = (files) => {
  if (!Array.isArray(files)) {
    throw new Error("Invalid image upload.");
  }

  for (const file of files) {
    if (!file.buffer || file.size === 0) {
      throw new Error("Uploaded images cannot be empty.");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("Each image must be 5 MB or less.");
    }

    if (!file.mimetype?.startsWith("image/")) {
      throw new Error("Only image files are allowed.");
    }
  }
};

// ADD PRODUCT
const AddProduct = async (req, res) => {
  const uploadedImages = [];

  try {
    const files = req.files || [];
    // validateFiles(files); // Assuming you have this defined

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required.",
      });
    }

    for (const file of files) {
      const result = await uploadImage(file.buffer, file.originalname);
      uploadedImages.push({ url: result.url, fileId: result.fileId });
    }

    // Safely parse FormData strings into proper Javascript types
    const parseJSON = (field) => {
      try { return field ? JSON.parse(field) : []; } 
      catch (e) { return field || []; }
    };

    // Construct the payload exactly matching your Schema
    const productData = {
      name: req.body.name,
      detail: req.body.detail,
      description: req.body.description,
      category: req.body.category,
      gender: req.body.gender,
      
      price: Number(req.body.price),
      originalPrice: Number(req.body.originalPrice),
      currency: req.body.currency || "INR",
      
      // FormData sends arrays as JSON strings, so we parse them
      sizes: parseJSON(req.body.sizes),
      colors: parseJSON(req.body.colors),
      
      material: req.body.material,
      fit: req.body.fit,
      sleeve: req.body.sleeve,
      
      rating: Number(req.body.rating) || 0,
      
      // Booleans from FormData come as string "true" or "false"
      isFeatured: req.body.isFeatured === "true",
      isNewArrival: req.body.isNewArrival === "true",
      isBestSeller: req.body.isBestSeller === "true",

      // IMPORTANT: Capital "I" to match your schema
      Images: uploadedImages, 
    };

    const product = await ProductModel.create(productData);

    return res.status(201).json({
      success: true,
      message: "Product added successfully.",
      product,
    });
  } catch (error) {
    // Clean up images if saving the product fails
    await Promise.allSettled(
      uploadedImages.map((image) => deleteImage(image.fileId))
    );

    console.error("Mongoose Error:", error.message);

    const status = error.message?.includes("10MB")
      ? 400
      : error.name === "ValidationError" || error.name === "CastError"
        ? 400
        : 500;

    return res.status(status).json({
      success: false,
      message: status === 500 ? "Failed to add product." : error.message,
    });
  }
};

// UPDATE PRODUCT

const UpdateProduct = async (req, res) => {
  const uploadedImages = [];

  try {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const files = req.files || [];

    // Parse JSON fields from FormData
    const parseJSON = (field) => {
      try {
        return field ? JSON.parse(field) : [];
      } catch (e) {
        return field || [];
      }
    };

    // Upload new images
    for (const file of files) {
      const result = await uploadImage(file.buffer, file.originalname);

      uploadedImages.push({
        url: result.url,
        fileId: result.fileId,
      });
    }

    // Update all fields supported by AddProduct
    const fields = [
      "name",
      "detail",
      "description",
      "category",
      "gender",
      "material",
      "fit",
      "sleeve",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // Number fields
    if (req.body.price !== undefined) {
      product.price = Number(req.body.price);
    }

    if (req.body.originalPrice !== undefined) {
      product.originalPrice = Number(req.body.originalPrice);
    }

    if (req.body.rating !== undefined) {
      product.rating = Number(req.body.rating);
    }

    // Currency
    if (req.body.currency !== undefined) {
      product.currency = req.body.currency;
    }

    // Array fields
    if (req.body.sizes !== undefined) {
      product.sizes = parseJSON(req.body.sizes);
    }

    if (req.body.colors !== undefined) {
      product.colors = parseJSON(req.body.colors);
    }

    // Boolean fields
    const booleanFields = [
      "isFeatured",
      "isNewArrival",
      "isBestSeller",
    ];

    booleanFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field] === "true";
      }
    });

    // Handle existing images
    let keptImagesUrls = [];

    if (req.body.existingImages !== undefined) {
      keptImagesUrls = parseJSON(req.body.existingImages);
    } else {
      // If existingImages isn't sent, keep all old images
      keptImagesUrls = (product.Images || []).map((img) => img.url);
    }

    const oldImages = product.Images || [];

    // Preserve existing image fileIds
    const keptImages = keptImagesUrls.map((url) => {
      const existingImage = oldImages.find(
        (img) => img.url === url
      );

      return existingImage
        ? {
            url: existingImage.url,
            fileId: existingImage.fileId,
          }
        : null;
    }).filter(Boolean);

    // Combine existing and newly uploaded images
    const finalImages = [
      ...keptImages,
      ...uploadedImages,
    ];

    // Find removed images
    const imagesToDelete = oldImages.filter(
      (oldImg) =>
        !finalImages.some(
          (finalImg) => finalImg.fileId === oldImg.fileId
        )
    );

    // Require at least one image
    if (finalImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required.",
      });
    }

    // Capital I to match your schema
    product.Images = finalImages;

    await product.save();

    // Delete removed images from cloud storage
    if (imagesToDelete.length > 0) {
      await Promise.allSettled(
        imagesToDelete.map((image) =>
          image.fileId ? deleteImage(image.fileId) : Promise.resolve()
        )
      );
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });

  } catch (error) {

    // Clean up newly uploaded images if update fails
    await Promise.allSettled(
      uploadedImages.map((image) =>
        deleteImage(image.fileId)
      )
    );

    console.error("Update Product Error:", error.message);

    const status =
      error.name === "ValidationError" ||
      error.name === "CastError" ||
      error.message?.includes("10MB")
        ? 400
        : 500;

    return res.status(status).json({
      success: false,
      message: status === 500
        ? "Failed to update product."
        : error.message,
    });
  }
};


// DELETE PRODUCT
const DeleteProduct = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Delete the database record first.
    await ProductModel.deleteOne({ _id: product._id });

    // Then attempt to delete its ImageKit files.
    const results = await Promise.allSettled(
      product.Images.map((image) => deleteImage(image.fileId))
    );

    const cleanupFailed = results.some(
      (result) => result.status === "rejected"
    );

    return res.status(200).json({
      success: true,
      message: cleanupFailed
        ? "Product deleted, but some images could not be removed from storage."
        : "Product and images deleted successfully.",
    });
  } catch (error) {
    const status =
      error.name === "CastError" ? 400 : 500;

    return res.status(status).json({
      success: false,
      message:
        status === 400
          ? "Invalid product ID."
          : "Failed to delete product.",
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.find();
    
    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

module.exports = {
  AddProduct,
  UpdateProduct,
  DeleteProduct,
  getAllProducts
};
