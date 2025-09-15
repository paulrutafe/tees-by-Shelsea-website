#!/bin/bash

# Tees By Shelsea - Enhanced E-commerce Deployment Script
# Run this script in your deploy-package folder

echo "🚀 Deploying Enhanced Tees By Shelsea E-commerce Platform"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "netlify.toml" ]; then
    echo "❌ Error: Please run this script from the deploy-package directory"
    exit 1
fi

echo "✅ Found netlify.toml - proceeding with deployment..."

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
fi

# Add all files
echo "📂 Adding all enhanced files to Git..."
git add .

# Create commit with detailed message
echo "💾 Creating commit with enhanced features..."
git commit -m "🎉 Enhanced E-commerce Platform

✨ New Features Added:
• Real clothing advertisement videos for all categories
• Complete checkout system with Stripe/PayPal/Apple Pay
• User authentication and registration system
• Buy Now buttons for immediate checkout
• Advanced shopping cart with promo codes
• Wholesale vs retail pricing system
• Mobile-responsive design enhancements
• Order confirmation and tracking system

🎥 Video Integration:
• Men's clothing showcase videos
• Women's fashion demonstration videos
• Shoes and accessories video content
• Interactive product video players

💳 E-commerce Features:
• Multi-step secure checkout process
• Real-time form validation
• Payment processing integration
• Order management system
• User account profiles with order history

🔧 Technical Improvements:
• Enhanced product database with video URLs
• Improved authentication system
• Advanced cart management
• Professional loading animations
• Success/error notification system

Ready for production deployment!"

echo "✅ Commit created successfully!"

# Check if remote origin exists
if git remote | grep -q "origin"; then
    echo "🔄 Pushing to existing GitHub repository..."
    git push origin main
else
    echo "⚠️  No remote repository found."
    echo "📋 Next steps:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin https://github.com/yourusername/your-repo-name.git"
    echo "3. Run: git push -u origin main"
fi

echo ""
echo "🎯 Deployment Complete!"
echo "=================================================="
echo "📊 Enhanced Features Summary:"
echo "• ✅ Real clothing advertisement videos"
echo "• ✅ Complete online purchasing system"
echo "• ✅ User authentication & registration"
echo "• ✅ Shopping cart with Buy Now buttons"
echo "• ✅ Secure checkout with multiple payment options"
echo "• ✅ Promo code system (WELCOME10, SUMMER20, etc.)"
echo "• ✅ Wholesale pricing for bulk buyers"
echo "• ✅ Mobile-responsive design"
echo "• ✅ Order tracking and confirmation"
echo ""
echo "🌐 Next: Your Netlify site will auto-deploy from GitHub!"
echo "📱 Test your enhanced e-commerce platform!"
