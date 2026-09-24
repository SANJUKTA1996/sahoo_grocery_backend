const Category = require("../models/Category");
const fs = require("fs");
const path = require("path");

const categories = [
  ["Rice", "rice", "basumati.jpg"],
  ["Dal & Pulses", "dal-pulses", "dal.jpg"],
  ["Oil & Ghee", "oil-ghee", "oilghee.jpg"],
  ["Atta & Flour", "atta-flour", "attaflour.jpg"],
  ["Dairy", "dairy", "dairy.jpg"],
  ["Beverages", "beverages", "beverages.jpg"],
  ["Snacks", "snacks", "snack.webp"],
  ["Spices", "spices", "spices.jpg"],
  ["Dry Fruits", "dry-fruits", "dryfruit.webp"],
  ["Biscuits", "biscuits", "biscuit.jpg"],
  ["Instant & Frozen", "instant-frozen", "frozen.webp"],
  ["Drink Mixes", "drink-mixes", "horlicks.jpg"],
  ["Soup & More", "soup-more", "sopu.webp"],
  ["Chocolates", "chocolates", "chocolate.jpg"],
  ["Sugar", "sugar", "sugar.jpg"],
  ["Flowers", "flowers", "marigold.jpg"],
  ["Fruits", "fruits", "dryfruit.webp"],
];

const getAssetDataUrl = (fileName) => {
  const filePath = path.resolve(
    __dirname,
    "../../grocery-client/src/assets",
    fileName,
  );
  if (!fs.existsSync(filePath)) return "";
  const extension = path.extname(fileName).toLowerCase().replace(".", "");
  const mimeType = extension === "jpg" ? "jpeg" : extension;
  return `data:image/${mimeType};base64,${fs.readFileSync(filePath).toString("base64")}`;
};

const seedCategories = async () => {
  await Category.deleteMany({ slug: "rice-test" });

  for (const [name, slug, imageFile] of categories) {
    const image = getAssetDataUrl(imageFile);
    const existing = await Category.findOne({ slug });

    if (!existing) {
      await Category.create({ name, slug, image });
    } else if (
      !existing.image ||
      existing.image.includes("placehold.co") ||
      existing.image.includes("example.com")
    ) {
      existing.name = name;
      existing.image = image;
      await existing.save();
    }
  }

  console.log("Categories are ready");
};

module.exports = seedCategories;
