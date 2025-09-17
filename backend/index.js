const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const stripe = require("stripe");
require("dotenv").config();

const port = process.env.PORT || 4000;

// Initialize Stripe
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());
app.use(cors());

// Database Connection With MongoDB
mongoose.connect(process.env.MONGODB_URI);


//Image Storage Engine
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({ storage: storage })

// Single image upload (backward compatibility)
app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `/images/${req.file.filename}`
  })
})

// Multiple images upload
app.post("/upload-multiple", upload.array('products', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: 0,
      message: "No files uploaded"
    });
  }

  const imageUrls = req.files.map(file => `/images/${file.filename}`);
  
  res.json({
    success: 1,
    image_urls: imageUrls,
    main_image: imageUrls[0] // First image as main image
  });
})


// Route for Images folder
app.use('/images', express.static('upload/images'));


// MiddleWare to fetch user from token
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  console.log("Token received:", token ? "Present" : "Missing");
  console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Present" : "Missing");
  
  if (!token) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verification successful, user ID:", data.user.id);
    req.user = data.user;
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};


// Schema for creating user model
const Users = mongoose.model("Users", {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  cartData: { type: Object },
  wishlist: { type: [Number], default: [] }, // Added wishlist feature
  date: { type: Date, default: Date.now() },
});


// Schema for creating Product
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, // Main image for backward compatibility
  images: { type: [String], default: [] }, // Array of multiple images
  category: { type: String, required: true },
  new_price: { type: Number },
  old_price: { type: Number },
  rating: { type: Number, default: 0 }, // Added rating field
  reviewCount: { type: Number, default: 0 }, // Added review count
  popularity: { type: Number, default: 0 }, // Added popularity field
  date: { type: Date, default: Date.now },
  avilable: { type: Boolean, default: true },
});


// ROOT API Route For Testing
app.get("/", (req, res) => {
  res.send("Root");
});


// Create an endpoint at ip/login for login the user and giving auth-token
app.post('/login', async (req, res) => {
  console.log("Login");
  let success = false;
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = await bcrypt.compare(req.body.password, user.password);
    if (passCompare) {
      const data = {
        user: {
          id: user.id
        }
      }
      success = true;
      console.log(user.id);
      const token = jwt.sign(data, process.env.JWT_SECRET);
      res.json({ success, token });
    }
    else {
      return res.status(400).json({ success: success, errors: "please try with correct email/password" })
    }
  }
  else {
    return res.status(400).json({ success: success, errors: "please try with correct email/password" })
  }
})


//Create an endpoint at ip/auth for regestring the user & sending auth-token
app.post('/signup', async (req, res) => {
  console.log("Sign Up");
  let success = false;
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: success, errors: "existing user found with this email" });
  }
  
  // Hash the password
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
  
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    cartData: cart,
  });
  await user.save();
  const data = {
    user: {
      id: user.id
    }
  }

  const token = jwt.sign(data, process.env.JWT_SECRET);
  success = true;
  res.json({ success, token })
})


// endpoint for getting all products data with sorting and pagination
app.get("/allproducts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'date'; // date, price, popularity, rating
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    let sortOptions = {};
    switch (sortBy) {
      case 'price':
        sortOptions = { new_price: sortOrder };
        break;
      case 'popularity':
        sortOptions = { popularity: sortOrder };
        break;
      case 'rating':
        sortOptions = { rating: sortOrder };
        break;
      case 'newest':
      case 'date':
      default:
        sortOptions = { date: sortOrder };
        break;
    }

    const products = await Product.find({}).sort(sortOptions).skip(skip).limit(limit);
    const total = await Product.countDocuments({});
    
    console.log("All Products with pagination");
    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});


// endpoint for getting latest products data
app.get("/newcollections", async (req, res) => {
  let products = await Product.find({});
  let arr = products.slice(0).slice(-8);
  console.log("New Collections");
  res.send(arr);
});


// endpoint for getting womens products data
app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({ category: "women" });
  let arr = products.splice(0, 4);
  console.log("Popular In Women");
  res.send(arr);
});

// endpoint for getting accessories products data
app.get("/popularinAccessories", async (req, res) => {
  let products = await Product.find({ category: "accessories" });
  let arr = products.splice(0, 4);
  console.log("Popular In Accessories");
  res.send(arr);
});

// endpoint for getting kids products data
app.get("/popularinkids", async (req, res) => {
  let products = await Product.find({ category: "kid" });
  let arr = products.splice(0, 4);
  console.log("Popular In Kids");
  res.send(arr);
});

// endpoint for getting womens products data
app.post("/relatedproducts", async (req, res) => {
  console.log("Related Products");
  const {category} = req.body;
  const products = await Product.find({ category });
  const arr = products.slice(0, 4);
  res.send(arr);
});


// Create an endpoint for saving the product in cart
app.post('/addtocart', fetchuser, async (req, res) => {
  console.log("Add Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
  res.send("Added")
})


// Create an endpoint for removing the product in cart
app.post('/removefromcart', fetchuser, async (req, res) => {
  console.log("Remove Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] != 0) {
    userData.cartData[req.body.itemId] -= 1;
  }
  await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
  res.send("Removed");
})


// Create an endpoint for getting cartdata of user
app.post('/getcart', fetchuser, async (req, res) => {
  console.log("Get Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);

})

// Wishlist endpoints
app.post('/addtowishlist', fetchuser, async (req, res) => {
  console.log("Add to Wishlist");
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    if (!userData.wishlist.includes(req.body.itemId)) {
      userData.wishlist.push(req.body.itemId);
      await Users.findOneAndUpdate({ _id: req.user.id }, { wishlist: userData.wishlist });
      res.json({ success: true, message: "Added to wishlist" });
    } else {
      res.json({ success: false, message: "Item already in wishlist" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding to wishlist" });
  }
})

app.post('/removefromwishlist', fetchuser, async (req, res) => {
  console.log("Remove from Wishlist");
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    userData.wishlist = userData.wishlist.filter(id => id !== req.body.itemId);
    await Users.findOneAndUpdate({ _id: req.user.id }, { wishlist: userData.wishlist });
    res.json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error removing from wishlist" });
  }
})

app.post('/getwishlist', fetchuser, async (req, res) => {
  console.log("Get Wishlist");
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    res.json({ success: true, wishlist: userData.wishlist || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching wishlist" });
  }
})

// Payment Integration - Stripe
app.post('/create-payment-intent', fetchuser, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      metadata: { userId: req.user.id }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    res.status(400).json({ success: false, error: error.message });
  }
})

app.post('/confirm-payment', fetchuser, async (req, res) => {
  try {
    const { paymentIntentId, orderDetails } = req.body;
    
    // Verify payment with Stripe
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Clear user's cart after successful payment
      await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: {} });
      
      // Here you would typically save order details to database
      // For now, we'll just confirm the payment
      
      res.json({
        success: true,
        message: "Payment confirmed and order placed successfully",
        orderId: paymentIntent.id
      });
    } else {
      res.status(400).json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    console.error('Payment confirmation failed:', error);
    res.status(400).json({ success: false, error: error.message });
  }
})


// Create an endpoint for adding products using admin panel
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  }
  else { id = 1; }

  // Handle both single and multiple images
  const images = req.body.images && req.body.images.length > 0 ? req.body.images : [req.body.image];
  
  const product = new Product({
    id: id,
    name: req.body.name,
    description: req.body.description,
    image: req.body.image, // Main image for backward compatibility
    images: images, // Array of all images
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  await product.save();
  console.log("Saved");
  res.json({ success: true, name: req.body.name })
});


// Create an endpoint for removing products using admin panel
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({ success: true, name: req.body.name })
});

// Migration endpoint to update existing products with images array
app.post("/migrate-products", async (req, res) => {
  try {
    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      if (!product.images || product.images.length === 0) {
        // Add the main image to the images array if not exists
        await Product.findByIdAndUpdate(product._id, {
          images: [product.image]
        });
        updatedCount++;
      }
    }

    res.json({ 
      success: true, 
      message: `Updated ${updatedCount} products with images array`,
      total_products: products.length
    });
  } catch (error) {
    res.json({ 
      success: false, 
      message: "Migration failed: " + error.message 
    });
  }
});

// Starting Express Server
app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});