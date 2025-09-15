#!/bin/bash

echo "🚀 GITHUB COMMIT HELPER - Tees By Shelsea"
echo "=========================================="
echo ""

echo "📋 STEP-BY-STEP GITHUB SETUP:"
echo ""

echo "1️⃣ **CREATE GITHUB REPOSITORY FIRST:**
echo "   • Go to https://github.com"
echo "   • Click '+' → 'New repository'"
echo "   • Name: tees-by-shelsea"
echo "   • Make it Public"
echo "   • Don't add README (we have one)"
echo "   • Click 'Create repository'"
echo ""

echo "2️⃣ **GET YOUR REPOSITORY URL:**
echo "   After creating, GitHub will show you a URL like:"
echo "   https://github.com/YOUR-USERNAME/tees-by-shelsea.git"
echo "   Copy this URL!"
echo ""

echo "3️⃣ **RUN THESE COMMANDS IN YOUR TERMINAL:**
echo ""

echo "# Navigate to your project folder"
echo "cd deploy-package"
echo ""

echo "# Initialize git repository"
echo "git init"
echo ""

echo "# Add all files to git"
echo "git add ."
echo ""

echo "# Create your first commit"
echo 'git commit -m "Initial commit - Tees By Shelsea e-commerce website"'
echo ""

echo "# Connect to your GitHub repository (REPLACE with YOUR URL)"
echo "git remote add origin https://github.com/YOUR-USERNAME/tees-by-shelsea.git"
echo ""

echo "# Push to GitHub"
echo "git branch -M main"
echo "git push -u origin main"
echo ""

echo "✅ **ALTERNATIVE: UPLOAD VIA WEB (EASIER)**"
echo "   1. Create repository on GitHub"
echo "   2. Click 'uploading an existing file'"
echo "   3. Drag all files from deploy-package folder"
echo "   4. Add commit message: 'Initial commit'"
echo "   5. Click 'Commit changes'"
echo ""

echo "📁 FILES TO UPLOAD:"
echo "Your deploy-package folder contains:"
ls -la deploy-package/ 2>/dev/null || echo "   All your website files are ready!"
echo ""

echo "🎯 **AFTER UPLOADING TO GITHUB:**
echo "   • Vercel: https://vercel.com → Import from GitHub"
echo "   • Netlify: https://netlify.com → New site from Git" 
echo "   • GitHub Pages: Repository Settings → Pages"
echo ""

echo "🔗 **YOUR FINAL LIVE LINKS WILL BE:**
echo "   • https://tees-by-shelsea.vercel.app"
echo "   • https://YOUR-USERNAME.github.io/tees-by-shelsea"
echo "   • https://amazing-name.netlify.app"
echo ""

echo "✨ Ready to share with the world!"