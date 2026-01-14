const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const app = express();

app.use(cors());
app.use(express.json());

const ACCESS_SECRET = "access_key_123";
const REFRESH_SECRET = "refresh_key_456";
const DB_FILE = "./db.json";

const readDB = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const init = { users: [], reviews: [], orders: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(init));
      return init;
    }
    const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    if (!db.users) db.users = [];
    if (!db.reviews) db.reviews = [];
    if (!db.orders) db.orders = []; 
    return db;
  } catch (e) {
    return { users: [], reviews: [], orders: [] };
  }
};
const writeDB = (data) =>
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  let db = readDB();
  if (db.users.find((u) => u.username === username))
    return res.status(400).json({ message: "Zajęte" });
  const role = username.toLowerCase() === "admin" ? "admin" : "user";
  db.users.push({ username, password, role, cart: [] });
  writeDB(db);
  res.json({ message: "OK" });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  let db = readDB();
  const user = db.users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return res.status(401).json({ message: "Błędne dane" });

  const accessToken = jwt.sign({ username, role: user.role }, ACCESS_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ username, role: user.role }, REFRESH_SECRET, {
    expiresIn: "7d",
  });

  res.json({
    accessToken,
    refreshToken,
    username,
    role: user.role,
    cart: user.cart || [],
  });
});

app.post("/api/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);
  jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign(
      { username: user.username, role: user.role },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ accessToken });
  });
});

app.post("/api/cart", (req, res) => {
  const { username, cart } = req.body;
  let db = readDB();
  const idx = db.users.findIndex((u) => u.username === username);
  if (idx !== -1) {
    db.users[idx].cart = cart;
    writeDB(db);
    res.json({ message: "Saved" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

app.post("/api/orders", (req, res) => {
  const { username, items, total } = req.body;
  let db = readDB();

  const newOrder = {
    id: Date.now(),
    date: new Date().toISOString(),
    username,
    items,
    total,
  };
  db.orders.push(newOrder);

  const userIdx = db.users.findIndex((u) => u.username === username);
  if (userIdx !== -1) {
    db.users[userIdx].cart = [];
  }

  writeDB(db);
  res.json({ message: "Order placed successfully" });
});

app.get("/api/orders/:username", (req, res) => {
  const { username } = req.params;
  const db = readDB();
  // Filtrujemy zamówienia tego konkretnego użytkownika
  const userOrders = db.orders.filter((o) => o.username === username);
  res.json(userOrders);
});

app.get("/api/reviews", (req, res) => res.json(readDB().reviews));

app.post("/api/reviews", (req, res) => {
  const { productId, text, rating, username } = req.body;
  let db = readDB();
  if (
    db.reviews.find((r) => r.productId === productId && r.username === username)
  ) {
    return res.status(400).json({ message: "Już oceniłeś ten produkt!" });
  }
  const newReview = {
    id: Date.now(),
    productId: parseInt(productId),
    text,
    rating,
    username,
  };
  db.reviews.push(newReview);
  writeDB(db);
  res.json(newReview);
});

app.delete("/api/reviews/:id", (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  let db = readDB();
  const user = db.users.find((u) => u.username === username);
  const review = db.reviews.find((r) => r.id == id);

  if (!user || !review) return res.status(404).json({ message: "Błąd danych" });

  if (user.role === "admin" || review.username === username) {
    db.reviews = db.reviews.filter((r) => r.id != id);
    writeDB(db);
    return res.json({ message: "Deleted" });
  }
  res.status(403).json({ message: "Brak uprawnień" });
});

app.listen(5000, () => console.log(">>> BACKEND NA PORCIE 5000 <<<"));
