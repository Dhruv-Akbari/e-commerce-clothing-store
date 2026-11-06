const express = require("express");
const router = express();
const multer = require("multer");

const {
  AddProduct,
  UpdateProduct,
  DeleteProduct,
  getAllProducts
} = require('../controller/product.controller');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    files: 8,
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/add",upload.array("images", 10),AddProduct);

router.put("/update/:id",upload.array("images", 10),UpdateProduct);

router.delete("/delete/:id", DeleteProduct);

router.get('/getAll',getAllProducts);

module.exports = router;