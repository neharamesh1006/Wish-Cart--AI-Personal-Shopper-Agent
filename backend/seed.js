const Database = require('better-sqlite3');

const db = new Database('wishcart.db');

console.log("Creating database schema...");

db.exec(`
  DROP TABLE IF EXISTS products;
  CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    tags TEXT NOT NULL
  )
`);

console.log("Seeding database with mock products...");

const insertProduct = db.prepare('INSERT INTO products (name, price, category, image, tags) VALUES (?, ?, ?, ?, ?)');

const MOCK_PRODUCTS = [
  // Electronics
  { name: "Sony WH-1000XM5 Headphones", price: 348.00, category: "electronics", image: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", tags: JSON.stringify(["music", "audio", "headphones", "gift", "noise cancelling"]) },
  { name: "MacBook Air M3", price: 1099.00, category: "electronics", image: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)", tags: JSON.stringify(["laptop", "computer", "apple", "work", "pc"]) },
  { name: "Mechanical Keyboard Keychron Q1", price: 179.00, category: "electronics", image: "linear-gradient(135deg, #434343 0%, #000000 100%)", tags: JSON.stringify(["keyboard", "gaming", "typing", "gift", "tech"]) },
  { name: "Samsung 4K Smart TV", price: 499.00, category: "electronics", image: "linear-gradient(135deg, #1e130c 0%, #9a8478 100%)", tags: JSON.stringify(["tv", "television", "home theater", "entertainment"]) },
  { name: "GoPro HERO12 Black", price: 399.00, category: "electronics", image: "linear-gradient(135deg, #8baaaa 0%, #ae8b9c 100%)", tags: JSON.stringify(["camera", "video", "action", "travel", "vlog"]) },
  
  // Home
  { name: "Aromatherapy Essential Oil Diffuser", price: 32.00, category: "home", image: "linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)", tags: JSON.stringify(["relax", "home", "diffuser", "scent", "gift", "wellness"]) },
  { name: "Cozy Chunky Knit Blanket", price: 65.00, category: "home", image: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", tags: JSON.stringify(["blanket", "warm", "cozy", "bedroom", "gift"]) },
  { name: "Set of 4 Ceramic Mugs", price: 24.00, category: "home", image: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", tags: JSON.stringify(["cup", "coffee", "tea", "kitchen", "mug"]) },
  { name: "Indoor Succulent Garden", price: 45.00, category: "home", image: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)", tags: JSON.stringify(["plant", "green", "decor", "garden", "gift"]) },
  
  // Food & Drink
  { name: "Gourmet Coffee Beans Bundle", price: 45.00, category: "food", image: "linear-gradient(135deg, #d4a373 0%, #faedcd 100%)", tags: JSON.stringify(["coffee", "drink", "gift", "beans", "espresso"]) },
  { name: "Artisan Chocolate Truffle Box", price: 38.00, category: "food", image: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", tags: JSON.stringify(["chocolate", "sweet", "gift", "candy", "dessert"]) },
  { name: "Matcha Green Tea Starter Set", price: 42.00, category: "food", image: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)", tags: JSON.stringify(["tea", "drink", "matcha", "healthy"]) },
  
  // Apparel & Beauty
  { name: "Luxury Skincare Set", price: 120.00, category: "beauty", image: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", tags: JSON.stringify(["skincare", "lotion", "serum", "face", "gift"]) },
  { name: "Unisex Cotton Hoodie", price: 55.00, category: "apparel", image: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)", tags: JSON.stringify(["clothes", "shirt", "hoodie", "warm", "casual"]) },
  { name: "Running Sneakers Pro", price: 130.00, category: "apparel", image: "linear-gradient(135deg, #fdcbf1 0%, #fdcbf1 1%)", tags: JSON.stringify(["shoes", "sneakers", "run", "workout", "fitness"]) },
];

const insertMany = db.transaction((products) => {
  for (const p of products) {
    insertProduct.run(p.name, p.price, p.category, p.image, p.tags);
  }
});

insertMany(MOCK_PRODUCTS);

console.log("Database seeded successfully with 15 products!");
db.close();
