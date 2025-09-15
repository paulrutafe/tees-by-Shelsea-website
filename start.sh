#!/bin/bash

# Tees By Shelsea - Startup Script

echo "🚀 Starting Tees By Shelsea E-commerce Website..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js to run this application."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if we're in the correct directory
if [ ! -f "simple-server.js" ]; then
    echo "❌ simple-server.js not found. Please run this script from the project directory."
    exit 1
fi

echo "✅ Project files found"
echo ""

# Start the server
echo "🌐 Starting server on http://localhost:3000"
echo "📱 Open your web browser and visit: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node simple-server.js