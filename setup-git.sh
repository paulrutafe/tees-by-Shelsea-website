#!/bin/bash

# Git setup script for Tees By Shelsea project

echo "🚀 Setting up Git for your Tees By Shelsea project..."
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first:"
    echo "   • Windows: Download from https://git-scm.com"
    echo "   • Mac: brew install git"
    echo "   • Linux: sudo apt install git"
    exit 1
fi

echo "✅ Git found: $(git --version)"

# Initialize git repository
echo "📦 Initializing Git repository..."
git init

# Add all files
echo "📁 Adding all project files..."
git add .

# Check git status
echo "📋 Git status:"
git status --short

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit - Tees By Shelsea full-stack e-commerce website

Features:
- Complete e-commerce frontend with HTML/CSS/JS
- Node.js backend with REST API
- Product catalog (Men, Women, Kids, Shoes)
- Shopping cart functionality
- Wholesale and retail pricing
- User authentication ready
- Mobile responsive design
- Contact forms and business features

Ready for deployment on Vercel, Netlify, or GitHub Pages"

echo ""
echo "✅ Git repository initialized successfully!"
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Create repository on GitHub: https://github.com/new"
echo "2. Name it: tees-by-shelsea"
echo "3. Copy the repository URL"
echo "4. Run: git remote add origin [YOUR-REPO-URL]"
echo "5. Run: git push -u origin main"
echo ""
echo "📱 Then deploy from GitHub using Vercel or Netlify!"