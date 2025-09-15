# Tees By Shelsea - Full-Stack E-commerce Website

## Overview
A complete full-stack e-commerce website for "Tees By Shelsea" - a clothing business specializing in wholesale and retail sales of men's, women's, and children's clothing, shoes, pants, and accessories.

## Features

### 🛍️ E-commerce Functionality
- **Product Catalog**: Browse products by category (Men, Women, Kids, Shoes)
- **Advanced Filtering**: Filter by price, size, color, stock status
- **Product Comparison**: Compare up to 3 products side-by-side
- **Shopping Cart**: Add, remove, modify quantities
- **Wishlist**: Save items for later
- **Search**: Real-time product search

### 👥 User Management
- **User Registration/Login**: JWT-based authentication
- **Account Types**: Retail customers and wholesale partners
- **Dynamic Pricing**: Different prices for retail vs wholesale users
- **Profile Management**: User account management

### 💼 Business Features
- **Wholesale Program**: Special pricing for business customers
- **Order Management**: Place and track orders
- **Inventory Tracking**: Real-time stock levels
- **Contact Forms**: Customer inquiries and wholesale requests

### 📱 Modern Design
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Smooth Animations**: CSS animations and transitions
- **Modern UI/UX**: Clean, professional design
- **Accessibility**: WCAG compliant design principles

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **JSON File Storage**: Simple data persistence (easily upgradeable to database)

### Frontend
- **Vanilla JavaScript**: No framework dependencies
- **Modern ES6+**: Classes, async/await, modules
- **CSS3**: Flexbox, Grid, animations
- **Font Awesome**: Icon library
- **Google Fonts**: Inter font family

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   ```
   http://localhost:3000
   ```

## Project Structure

```
.
├── package.json          # Project dependencies and scripts
├── server.js              # Express.js backend server
├── data/                  # JSON data storage (auto-created)
│   ├── users.json        # User accounts
│   ├── products.json     # Product catalog
│   └── orders.json       # Order history
├── public/               # Frontend assets
│   ├── index.html        # Main HTML file
│   ├── styles/
│   │   └── main.css      # Main stylesheet
│   └── scripts/
│       ├── app.js        # Main application logic
│       ├── auth.js       # Authentication module
│       ├── cart.js       # Shopping cart functionality
│       └── products.js   # Product management
└── README.md             # This file
```

## API Endpoints

### Authentication
- `POST /api/register` - Create new user account
- `POST /api/login` - User login

### Products
- `GET /api/products` - Get all products (with optional filters)
- `GET /api/products/:id` - Get specific product

### Orders
- `POST /api/orders` - Place new order (authenticated)
- `GET /api/orders` - Get user's orders (authenticated)

## Configuration

### Environment Variables
Create a `.env` file for production:

```env
PORT=3000
JWT_SECRET=your-secure-jwt-secret-key
NODE_ENV=production
```

### Default Data
The application comes with sample products including:
- Men's Classic T-Shirt
- Kids' Fun Graphic Tee
- Women's Denim Jeans
- Unisex Sneakers

## Usage Guide

### For Customers
1. **Browse Products**: Use the navigation or category cards
2. **Search**: Use the search bar in the header
3. **Filter**: Apply advanced filters for specific needs
4. **Compare**: Select products to compare features
5. **Add to Cart**: Click the cart icon on product cards
6. **Register/Login**: Create account for better prices (wholesale)
7. **Checkout**: Complete purchase through the cart

### For Wholesale Partners
1. **Register**: Choose "Wholesale Partner" account type
2. **Login**: Access wholesale pricing
3. **Bulk Orders**: Add larger quantities
4. **Special Pricing**: See reduced wholesale prices
5. **Business Features**: Access wholesale inquiry forms

### For Administrators
- User data is stored in `data/users.json`
- Product catalog in `data/products.json`
- Orders in `data/orders.json`
- Modify these files to update content

## Customization

### Adding Products
Edit `data/products.json` or add products through the server API:

```json
{
  "id": "unique-id",
  "name": "Product Name",
  "category": "men|women|kids|shoes",
  "description": "Product description",
  "retailPrice": 29.99,
  "wholesalePrice": 19.99,
  "sizes": ["S", "M", "L"],
  "colors": ["Black", "White"],
  "stock": 50,
  "featured": true
}
```

### Styling
Modify `public/styles/main.css` for design changes:
- Colors: Update CSS custom properties
- Fonts: Change Google Fonts imports
- Layout: Modify CSS Grid and Flexbox properties

### Business Information
Update contact details, addresses, and business info in:
- `public/index.html` - Contact section
- `server.js` - Default addresses for orders

## Deployment

### Production Deployment
1. **Environment**: Set `NODE_ENV=production`
2. **Security**: Use strong JWT secret
3. **HTTPS**: Enable SSL/TLS
4. **Database**: Consider upgrading to PostgreSQL/MongoDB
5. **Payment**: Integrate Stripe/PayPal
6. **Images**: Add image upload functionality

### Hosting Options
- **Heroku**: Easy deployment with git
- **Vercel**: Great for full-stack apps
- **DigitalOcean**: VPS with full control
- **AWS**: Scalable cloud deployment

## Future Enhancements

### Planned Features
- [ ] Image upload and gallery
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Order tracking
- [ ] Product reviews and ratings
- [ ] Advanced admin dashboard
- [ ] Inventory management
- [ ] Multi-language support
- [ ] SEO optimization
- [ ] Progressive Web App (PWA)

### Database Migration
For production, consider migrating from JSON files to:
- **PostgreSQL**: Relational database
- **MongoDB**: Document-based NoSQL
- **MySQL**: Traditional relational DB

## Support

### Troubleshooting
1. **Port Issues**: Change PORT in server.js
2. **Dependencies**: Run `npm install` again
3. **Data Issues**: Delete `data/` folder to reset
4. **Browser Cache**: Clear cache and cookies

### Development
- Use `npm run dev` for auto-restart
- Check browser console for errors
- Monitor server logs for API issues
- Use browser dev tools for debugging

## License
MIT License - feel free to modify and use for your business needs.

## Credits
- **Developed by**: MiniMax Agent
- **Font**: Inter by Google Fonts
- **Icons**: Font Awesome
- **Design**: Modern e-commerce best practices

---

**Tees By Shelsea** - Premium Quality • Affordable Prices • Exceptional Service