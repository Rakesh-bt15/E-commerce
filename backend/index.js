const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
const streamifier = require("streamifier");
require("dotenv").config();
const { v2: cloudinary } = require("cloudinary");

app.use(express.json());
app.use(cors());


mongoose.connect(process.env.MONGO_URI);

app.get("/", (req, res) => {
  res.send("Express App is Running");
});


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// IMAGE UPLOAD 
const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.single("product"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: 0, message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      {
        folder: "ecommerce_products",
      }
    );

    res.json({
      success: 1,
      image_url: result.secure_url,
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ success: 0 });
  }
});

//  PRODUCT SCHEMA 
const Product = mongoose.model("Product", {
  id: Number,
  name: String,
  image: String,
  category: String,
  new_price: Number,
  old_price: Number,
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});

// ADD PRODUCT
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id = products.length ? products.slice(-1)[0].id + 1 : 1;

  const product = new Product({
    id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });

  await product.save();
  res.json({ success: true });
});

// REMOVE PRODUCT
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true });
});

// ALL PRODUCTS
app.get("/allproducts", async (req, res) => {
  const products = await Product.find({});
  res.send(products);
});


const Users = mongoose.model("users", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: Object,
  date: { type: Date, default: Date.now },
});

// SIGNUP
app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) return res.status(400).json({ success: false });

  let cart = {};
  for (let i = 0; i < 300; i++) cart[i] = 0;

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();

  const token = jwt.sign({ user: { id: user.id } }, "secret_ecom");
  res.json({ success: true, token });
});

// LOGIN
app.post("/login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (!user) return res.json({ success: false });

  if (req.body.password !== user.password)
    return res.json({ success: false });

  const token = jwt.sign({ user: { id: user.id } }, "secret_ecom");
  res.json({ success: true, token });
});

// CART
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send();

  try {
    req.user = jwt.verify(token, "secret_ecom").user;
    next();
  } catch {
    res.status(401).send();
  }
};

app.post("/addtocart", fetchUser, async (req, res) => {
  let user = await Users.findById(req.user.id);
  user.cartData[req.body.itemId] += 1;
  await user.save();
  res.json({ success: true });
});

app.post("/removefromcart", fetchUser, async (req, res) => {
  let user = await Users.findById(req.user.id);
  user.cartData[req.body.itemId] -= 1;
  await user.save();
  res.json({ success: true });
});

app.post("/getcart", fetchUser, async (req, res) => {
  let user = await Users.findById(req.user.id);
  res.json(user.cartData);
});



app.listen(port, () => {
  console.log("Server Running on Port " + port);
});