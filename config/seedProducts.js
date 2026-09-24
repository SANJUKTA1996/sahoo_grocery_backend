const Product = require("../models/Product");

const catalogProducts = [
  ["Basmati Rice - 5kg", "Rice", 850],
  ["Sona Masoori - 5kg", "Rice", 520],
  ["Ponni Rice - 5kg", "Rice", 600],
  ["Broken Rice - 5kg", "Rice", 400],
  ["Premium Rice - 5kg", "Rice", 1200],
  ["Miniket Rice - 5kg", "Rice", 700],
  ["Jira Rice - 5kg", "Rice", 900],
  ["Sugar Control Rice - 5kg", "Rice", 1000],
  ["Toor Dal - 1kg", "Dal & Pulses", 170],
  ["Moong Dal - 1kg", "Dal & Pulses", 160],
  ["The Himalayan Legacy Bhatt Dal - 1kg", "Dal & Pulses", 200],
  ["Pro Nature Organic Panchratna Dal - 1kg", "Dal & Pulses", 250],
  ["Moosar Dal - 1kg", "Dal & Pulses", 180],
  ["Dal - 1kg", "Dal & Pulses", 150],
  ["Fortune Refined Oil - 1L", "Oil & Ghee", 180],
  ["Aashirvaad Ghee - 500g", "Oil & Ghee", 320],
  ["Fortune Mustard Oil - 1L", "Oil & Ghee", 200],
  ["Fortune Soya Oil - 1L", "Oil & Ghee", 190],
  ["Satvik Ghee - 500g", "Oil & Ghee", 350],
  ["Barosi Ghee - 500g", "Oil & Ghee", 300],
  ["Dabur Ghee - 500g", "Oil & Ghee", 280],
  ["Aashirvaad Atta - 5kg", "Atta & Flour", 260],
  ["Sharma Flour - 2kg", "Atta & Flour", 120],
  ["Yellow Corn Flour - 1kg", "Atta & Flour", 150],
  ["Wheafree Corn Flour - 1kg", "Atta & Flour", 180],
  ["Ahaar Makki Atta - 2kg", "Atta & Flour", 200],
  ["MVR Corn Flour - 1kg", "Atta & Flour", 170],
  ["Fortune Chakki Atta - 5kg", "Atta & Flour", 300],
  ["Amul Gold - 500ml", "Dairy", 60],
  ["Milk - 1L", "Dairy", 60],
  ["Fanta - 1L", "Beverages", 60],
  ["Sprite - 1L", "Beverages", 60],
  ["Coca Cola - 1L", "Beverages", 60],
  ["Lays Chips - 100g", "Snacks", 20],
  ["KurKure - 100g", "Snacks", 20],
  ["Snack - 100g", "Snacks", 20],
  ["Dairy Milk - 100g", "Chocolates", 20],
  ["Perk - 100g", "Chocolates", 20],
  ["Snickers Minis - 100g", "Chocolates", 20],
  ["5 Star - 100g", "Chocolates", 20],
  ["Marigold - 100g", "Biscuits", 20],
  ["Dark Fanta - 100g", "Biscuits", 20],
  ["Kabab - 100g", "Instant & Frozen", 20],
  ["Potato Frozen - 100g", "Instant & Frozen", 20],
  ["Walnut - 100g", "Dry Fruits", 20],
  ["Mix Nut - 100g", "Dry Fruits", 20],
  ["Horlicks - 100g", "Drink Mixes", 20],
  ["Tang - 100g", "Drink Mixes", 20],
  ["Turmeric Powder - 100g", "Spices", 20],
  ["Coriander Powder - 100g", "Spices", 20],
  ["Hot Soup - 100g", "Soup & More", 20],
  ["Chicken Soup - 100g", "Soup & More", 20],
  ["White Sugar - 5kg", "Sugar", 250],
  ["Brown Sugar - 1kg", "Sugar", 120],
];

const seedProducts = async () => {
  await Promise.all(
    catalogProducts.map(([name, category, price]) =>
      Product.updateOne(
        { name, category },
        {
          $setOnInsert: {
            name,
            category,
            price,
            stock: 100,
            description: "",
            image: `https://placehold.co/300x300/f5f5f5/333?text=${encodeURIComponent(name)}`,
          },
        },
        { upsert: true },
      ),
    ),
  );

  console.log("Catalog products are ready");
};

module.exports = seedProducts;
