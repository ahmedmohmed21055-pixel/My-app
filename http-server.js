const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;

// In-memory storage
let products = [
  {
    id: "1",
    name: "سلك نحاس تركي 2.5 مم",
    purchasePrice: 15.50,
    sellPrice: 18.60,
    qty: 100,
    img: "https://via.placeholder.com/150",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2", 
    name: "بطارية AAA دوراسيل",
    purchasePrice: 2.25,
    sellPrice: 3.00,
    qty: 50,
    img: "https://via.placeholder.com/150",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "3",
    name: "مصباح LED 9 واط",
    purchasePrice: 8.00,
    sellPrice: 12.00,
    qty: 25,
    img: "https://via.placeholder.com/150",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "4",
    name: "كابل USB نوع C",
    purchasePrice: 5.75,
    sellPrice: 8.50,
    qty: 30,
    img: "https://via.placeholder.com/150",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let idCounter = 5;

// Helper functions
function getRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function serveFile(res, filePath) {
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code == 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('404 Not Found', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf-8');
    }
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // API Routes
  if (pathname.startsWith('/api/')) {
    
    // GET /api/items
    if (pathname === '/api/items' && method === 'GET') {
      sendJSON(res, products);
      return;
    }

    // GET /api/items/:id
    if (pathname.startsWith('/api/items/') && method === 'GET') {
      const id = pathname.split('/')[3];
      const product = products.find(p => p.id === id);
      if (!product) {
        sendJSON(res, { success: false, message: "الصنف غير موجود" }, 404);
        return;
      }
      sendJSON(res, product);
      return;
    }

    // POST /api/items
    if (pathname === '/api/items' && method === 'POST') {
      const body = await getRequestBody(req);
      const { name, purchasePrice, sellPrice, qty, img } = body;
      
      if (!name) {
        sendJSON(res, { success: false, message: "اسم الصنف مطلوب" }, 400);
        return;
      }

      const newProduct = {
        id: String(idCounter++),
        name,
        purchasePrice: Number(purchasePrice) || 0,
        sellPrice: Number(sellPrice) || 0,
        qty: Number(qty) || 0,
        img: img || "",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      products.push(newProduct);
      sendJSON(res, newProduct, 201);
      return;
    }

    // PUT /api/items/:id
    if (pathname.startsWith('/api/items/') && method === 'PUT') {
      const id = pathname.split('/')[3];
      const index = products.findIndex(p => p.id === id);
      if (index === -1) {
        sendJSON(res, { success: false, message: "الصنف غير موجود" }, 404);
        return;
      }

      const body = await getRequestBody(req);
      const { name, purchasePrice, sellPrice, qty, img } = body;
      
      products[index] = {
        ...products[index],
        ...(name && { name }),
        ...(purchasePrice !== undefined && { purchasePrice: Number(purchasePrice) }),
        ...(sellPrice !== undefined && { sellPrice: Number(sellPrice) }),
        ...(qty !== undefined && { qty: Number(qty) }),
        ...(img !== undefined && { img }),
        updatedAt: new Date()
      };

      sendJSON(res, products[index]);
      return;
    }

    // DELETE /api/items/:id
    if (pathname.startsWith('/api/items/') && method === 'DELETE') {
      const id = pathname.split('/')[3];
      const index = products.findIndex(p => p.id === id);
      if (index === -1) {
        sendJSON(res, { success: false, message: "الصنف غير موجود" }, 404);
        return;
      }

      products.splice(index, 1);
      sendJSON(res, { success: true, message: "تم حذف الصنف بنجاح" });
      return;
    }

    // POST /api/ai
    if (pathname === '/api/ai' && method === 'POST') {
      const body = await getRequestBody(req);
      const { prompt } = body;
      
      if (!prompt) {
        sendJSON(res, { success: false, message: "السؤال مطلوب" }, 400);
        return;
      }

      let response = "عذراً، لا يمكنني الإجابة على هذا السؤال حالياً.";
      
      const lowerPrompt = prompt.toLowerCase();
      
      if (lowerPrompt.includes("سعر") && lowerPrompt.includes("سلك")) {
        response = "أسعار الأسلاك النحاسية تتراوح بين 15-25 جنيه حسب النوع والسُمك. أنصح بمراجعة السوق للأسعار الحالية.";
      } else if (lowerPrompt.includes("بطارية")) {
        response = "بطاريات AAA عادة تُباع بهامش ربح 25-35%. إذا كان سعر الشراء 2.25 جنيه، يمكن بيعها بـ 3-3.25 جنيه.";
      } else if (lowerPrompt.includes("مصباح") || lowerPrompt.includes("لمبة")) {
        response = "مصابيح LED لها هامش ربح جيد 40-50%. المصابيح 9 واط تُباع عادة بين 10-15 جنيه.";
      } else if (lowerPrompt.includes("كابل") || lowerPrompt.includes("سلك")) {
        response = "كابلات USB نوع C لها طلب عالي. هامش ربح 30-40% مناسب. الأسعار تتراوح 6-12 جنيه حسب الجودة.";
      } else if (lowerPrompt.includes("نصيحة") || lowerPrompt.includes("اقتراح")) {
        response = "أنصح بمراقبة المخزون باستمرار وتحديث الأسعار حسب السوق. ركز على الأصناف سريعة الحركة.";
      }
      
      sendJSON(res, { text: response });
      return;
    }

    // API route not found
    sendJSON(res, { success: false, message: "API endpoint not found" }, 404);
    return;
  }

  // Serve static files
  const clientPath = path.join(__dirname, '../client');
  let filePath = path.join(clientPath, pathname === '/' ? 'index.html' : pathname);

  // Check if file exists, if not serve index.html for SPA routing
  if (!fs.existsSync(filePath) && pathname !== '/') {
    filePath = path.join(clientPath, 'index.html');
  }

  serveFile(res, filePath);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Arabic Store Management System running on http://0.0.0.0:${PORT}`);
  console.log(`📱 مرحباً بك في نظام إدارة متجر أبوالنور!`);
  console.log(`\n🔗 Open: http://localhost:${PORT}`);
});