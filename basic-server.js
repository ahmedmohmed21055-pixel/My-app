const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
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

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get("/api/items", (req, res) => {
  res.json(products);
});

app.get("/api/items/:id", (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "الصنف غير موجود" });
  }
  res.json(product);
});

app.post("/api/items", (req, res) => {
  const { name, purchasePrice, sellPrice, qty, img } = req.body;
  
  if (!name) {
    return res.status(400).json({ success: false, message: "اسم الصنف مطلوب" });
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
  res.status(201).json(newProduct);
});

app.put("/api/items/:id", (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "الصنف غير موجود" });
  }

  const { name, purchasePrice, sellPrice, qty, img } = req.body;
  
  products[index] = {
    ...products[index],
    ...(name && { name }),
    ...(purchasePrice !== undefined && { purchasePrice: Number(purchasePrice) }),
    ...(sellPrice !== undefined && { sellPrice: Number(sellPrice) }),
    ...(qty !== undefined && { qty: Number(qty) }),
    ...(img !== undefined && { img }),
    updatedAt: new Date()
  };

  res.json(products[index]);
});

app.delete("/api/items/:id", (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "الصنف غير موجود" });
  }

  products.splice(index, 1);
  res.json({ success: true, message: "تم حذف الصنف بنجاح" });
});

app.post("/api/ai", (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ success: false, message: "السؤال مطلوب" });
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
  
  res.json({ text: response });
});

// Serve static files
const clientPath = path.join(__dirname, "../client");
app.use(express.static(clientPath));

// Handle client-side routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientPath, 'index.html'));
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Arabic Store Management System running on http://0.0.0.0:${PORT}`);
  console.log(`📱 مرحباً بك في نظام إدارة متجر أبوالنور!`);
});