const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
};

// Sample products data
const sampleProducts = [
    {
        id: '1',
        name: "Men's Classic T-Shirt",
        category: "men",
        description: "Premium cotton t-shirt for everyday wear",
        retailPrice: 24.99,
        wholesalePrice: 14.99,
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Black", "White", "Navy", "Gray"],
        stock: 100,
        featured: true
    },
    {
        id: '2',
        name: "Kids' Fun Graphic Tee",
        category: "kids",
        description: "Colorful graphic t-shirt perfect for kids",
        retailPrice: 18.99,
        wholesalePrice: 10.99,
        sizes: ["2T", "3T", "4T", "5T", "6T"],
        colors: ["Blue", "Pink", "Yellow", "Green"],
        stock: 75,
        featured: true
    },
    {
        id: '3',
        name: "Women's Denim Jeans",
        category: "women",
        description: "Stylish and comfortable denim jeans",
        retailPrice: 49.99,
        wholesalePrice: 29.99,
        sizes: ["26", "28", "30", "32", "34"],
        colors: ["Dark Blue", "Light Blue", "Black"],
        stock: 60,
        featured: false
    },
    {
        id: '4',
        name: "Unisex Sneakers",
        category: "shoes",
        description: "Comfortable everyday sneakers for all ages",
        retailPrice: 79.99,
        wholesalePrice: 45.99,
        sizes: ["6", "7", "8", "9", "10", "11", "12"],
        colors: ["White", "Black", "Gray"],
        stock: 40,
        featured: true
    }
];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Handle API routes
    if (pathname.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        if (pathname === '/api/products') {
            res.writeHead(200);
            res.end(JSON.stringify(sampleProducts));
            return;
        }

        if (pathname.startsWith('/api/products/')) {
            const productId = pathname.split('/')[3];
            const product = sampleProducts.find(p => p.id === productId);
            if (product) {
                res.writeHead(200);
                res.end(JSON.stringify(product));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Product not found' }));
            }
            return;
        }

        // Default API response
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'API endpoint not found' }));
        return;
    }

    // Serve static files
    let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - File Not Found');
            return;
        }

        const ext = path.extname(filePath);
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 - Internal Server Error');
                return;
            }

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Tees By Shelsea server running on port ${PORT}`);
    console.log(`📱 Visit: http://localhost:${PORT}`);
    console.log('✨ Full-stack e-commerce website is ready!');
    console.log('');
    console.log('Features:');
    console.log('• Product catalog with categories');
    console.log('• Shopping cart functionality');
    console.log('• User authentication (frontend ready)');
    console.log('• Wholesale vs retail pricing');
    console.log('• Responsive design');
    console.log('• Advanced product filtering');
    console.log('• Product comparison');
    console.log('• Contact forms');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});