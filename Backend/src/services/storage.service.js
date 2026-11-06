const { ImageKit, toFile } = require("@imagekit/nodejs");

const imagekit = new ImageKit({
  privateKey: process.env.PRIVATE_KEY,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const MAX_FILE_SIZE = 9 * 1024 * 1024;

async function uploadImage(buffer, fileName = "product.jpg") {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error("A valid, non-empty image is required.");
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("Each image must be 5 MB or less.");
  }

  const file = await toFile(buffer, fileName);

  return imagekit.files.upload({
    file,
    fileName: `coras_${Date.now()}_${fileName}`,
    folder: "/coras/products",
  });
}

async function deleteImage(fileId) {
  if (!fileId) return;

  return imagekit.files.delete(fileId);
}

module.exports = { uploadImage, deleteImage };