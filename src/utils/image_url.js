export const generateImageUrl = (req, imagePath) => {
  if (!imagePath) {
    return null;
  }

  return `${req.protocol}://${req.get("host")}${imagePath}`;
};

export const generateImageUrls = (req, images = []) => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.map((image) => {
    return `${req.protocol}://${req.get("host")}${image}`;
  });
};
