import { Router } from "express";
import { storage } from "./storage.js";
import { insertProductSchema, updateProductSchema, aiRequestSchema } from "../shared/schema.js";

const router = Router();

// Get all products
router.get("/api/items", async (req, res) => {
  try {
    const products = await storage.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: "خطأ في استرجاع البيانات" });
  }
});

// Get single product
router.get("/api/items/:id", async (req, res) => {
  try {
    const product = await storage.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "الصنف غير موجود" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ success: false, message: "خطأ في استرجاع البيانات" });
  }
});

// Create new product
router.post("/api/items", async (req, res) => {
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

// Update product
router.put("/api/items/:id", async (req, res) => {
  try {
    const validatedData = insertProductSchema.partial().parse(req.body);
    const product = await storage.updateProduct(req.params.id, validatedData);
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

// Delete product
router.delete("/api/items/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "الصنف غير موجود" });
    }
    res.json({ success: true, message: "تم حذف الصنف بنجاح" });
  } catch (error) {
    res.status(500).json({ success: false, message: "خطأ في حذف الصنف" });
  }
});

// AI assistant endpoint
router.post("/api/ai", async (req, res) => {
  try {
    const { prompt } = aiRequestSchema.parse(req.body);
    
    // Simple AI response logic (can be enhanced with real AI later)
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

export default router;