const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data storage (in production, use a proper database)
let users = [];
let products = [];
let orders = [];

// Load initial data
const loadData = () => {
  try {
    if (fs.existsSync('data/users.json')) {
      users = JSON.parse(fs.readFileSync('data/users.json', 'utf8'));
    }
    if (fs.existsSync('data/products.json')) {
      products = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
    }
    if (fs.existsSync('data/orders.json')) {
      orders = JSON.parse(fs.readFileSync('data/orders.json', 'utf8'));
    }
  } catch (error) {
    console.log('No existing data found, starting fresh');
  }
};

// Save data
const saveData = () => {
  if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
  }
  fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
  fs.writeFileSync('data/products.json', JSON.stringify(products, null, 2));
  fs.writeFileSync('data/orders.json', JSON.stringify(orders, null, 2));
};

// Initialize sample data
const initializeSampleData = () => {
  if (products.length === 0) {
    products = [
      {
        id: uuidv4(),
        name: "Men's Classic T-Shirt",
        category: "men",
        subcategory: "shirts",
        description: "Premium cotton t-shirt for everyday wear",
        retailPrice: 24.99,
        wholesalePrice: 14.99,
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Black", "White", "Navy", "Gray"],
        stock: 100,
        image: "images/mens-tshirt.jpg",
        featured: true
      },
      {
        id: uuidv4(),
        name: "Kids' Fun Graphic Tee",
        category: "kids",
        subcategory: "shirts",
        description: "Colorful graphic t-shirt perfect for kids",
        retailPrice: 18.99,
        wholesalePrice: 10.99,
        sizes: ["2T", "3T", "4T", "5T", "6T"],
        colors: ["Blue", "Pink", "Yellow", "Green"],
        stock: 75,
        image: "images/kids-tshirt.jpg",
        featured: true
      },
      {
        id: uuidv4(),
        name: "Women's Denim Jeans",
        category: "women",
        subcategory: "pants",
        description: "Stylish and comfortable denim jeans",
        retailPrice: 49.99,
        wholesalePrice: 29.99,
        sizes: ["26", "28", "30", "32", "34"],
        colors: ["Dark Blue", "Light Blue", "Black"],
        stock: 60,
        image: "images/womens-jeans.jpg",
        featured: false
      },
      {
        id: uuidv4(),
        name: "Unisex Sneakers",
        category: "shoes",
        subcategory: "casual",
        description: "Comfortable everyday sneakers for all ages",
        retailPrice: 79.99,
        wholesalePrice: 45.99,
        sizes: ["6", "7", "8", "9", "10", "11", "12"],
        colors: ["White", "Black", "Gray"],
        stock: 40,
        image: "images/sneakers.jpg",
        featured: true
      }
    ];
    saveData();
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name, accountType } = req.body;
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      accountType: accountType || 'retail',
      createdAt: new Date().toISOString()
    };
    
    users.push(user);
    saveData();
    
    const token = jwt.sign({ userId: user.id, email: user.email, accountType: user.accountType }, JWT_SECRET);
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        accountType: user.accountType 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, email: user.email, accountType: user.accountType }, JWT_SECRET);
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        accountType: user.accountType 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Product routes
app.get('/api/products', (req, res) => {
  const { category, search, featured } = req.query;
  let filteredProducts = [...products];
  
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (featured === 'true') {
    filteredProducts = filteredProducts.filter(p => p.featured);
  }
  
  res.json(filteredProducts);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Order routes
app.post('/api/orders', authenticateToken, (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod } = req.body;
    
    const order = {
      id: uuidv4(),
      userId: req.user.userId,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      status: 'pending',
      total: items.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        const price = req.user.accountType === 'wholesale' ? product.wholesalePrice : product.retailPrice;
        return sum + (price * item.quantity);
      }, 0),
      createdAt: new Date().toISOString()
    };
    
    orders.push(order);
    saveData();
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Order creation failed' });
  }
});

app.get('/api/orders', authenticateToken, (req, res) => {
  const userOrders = orders.filter(o => o.userId === req.user.userId);
  res.json(userOrders);
});

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize data and start server
loadData();
initializeSampleData();

app.listen(PORT, () => {
  console.log(`🚀 Tees By Shelsea server running on port ${PORT}`);
  console.log(`📱 Visit: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('💾 Saving data before shutdown...');
  saveData();
  process.exit(0);
});