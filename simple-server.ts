import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage.js";
import { insertProductSchema, aiRequestSchema } from "../shared/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get("/api/items", async (req, res) => {
  try {
    const products = await storage.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: "خطأ في استرجاع البيانات" });
  }
});

app.get("/api/items/*", async (req, res) => {
  try {
    const id = req.url.split('/').pop();
    if (!id) {
      return res.status(400).json({ success: false, message: "معرف الصنف مطلوب" });
    }
    const product = await storage.getProductById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "الصنف غير موجود" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ success: false, message: "خطأ في استرجاع البيانات" });
  }
});

app.post("/api/items", async (req, res) => {
  try {
    const validatedData = insertProductSchema.parse(req.body);
    const product = await storage.createProduct(validatedData);
    res.status(201).json(product);
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: "بيانات غير صحيحة", errors: error.errors });
    }
    res.status(500).json({ success: false, message: "خطأ في إنشاء الصنف" });
  }
});

app.put("/api/items/*", async (req, res) => {
  try {
    const id = req.url.split('/').pop();
    if (!id) {
      return res.status(400).json({ success: false, message: "معرف الصنف مطلوب" });
    }
    const validatedData = insertProductSchema.partial().parse(req.body);
    const product = await storage.updateProduct(id, validatedData);
    if (!product) {
      return res.status(404).json({ success: false, message: "الصنف غير موجود" });
    }
    res.json(product);
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: "بيانات غير صحيحة", errors: error.errors });
    }
    res.status(500).json({ success: false, message: "خطأ في تحديث الصنف" });
  }
});

app.delete("/api/items/*", async (req, res) => {
  try {
    const id = req.url.split('/').pop();
    if (!id) {
      return res.status(400).json({ success: false, message: "معرف الصنف مطلوب" });
    }
    const deleted = await storage.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "الصنف غير موجود" });
    }
    res.json({ success: true, message: "تم حذف الصنف بنجاح" });
  } catch (error) {
    res.status(500).json({ success: false, message: "خطأ في حذف الصنف" });
  }
});

app.post("/api/ai", async (req, res) => {
  try {
    const { prompt } = aiRequestSchema.parse(req.body);
    
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
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: "طلب غير صحيح" });
    }
    res.status(500).json({ success: false, message: "خطأ في معالجة الطلب" });
  }
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