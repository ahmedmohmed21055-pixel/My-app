import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Bot } from "lucide-react";
import { apiRequest } from "../lib/queryClient";
import { Product, InsertProduct } from "../../../shared/schema";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";

interface DashboardProps {
  activeTab: string;
}

export default function Dashboard({ activeTab }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/items"],
  });

  // Filter products based on search and active tab
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeTab) {
      case "shortages":
        return matchesSearch && product.qty <= 5;
      case "marketCompare":
      case "bestSellers":
        return matchesSearch; // For now, show all products
      default:
        return matchesSearch;
    }
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: (product: InsertProduct) =>
      apiRequest("/api/items", {
        method: "POST",
        body: JSON.stringify(product),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      setIsModalOpen(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      alert(`خطأ في الإضافة: ${error.message}`);
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, product }: { id: string; product: InsertProduct }) =>
      apiRequest(`/api/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(product),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      setIsModalOpen(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      alert(`خطأ في التحديث: ${error.message}`);
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/items/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
    },
    onError: (error) => {
      alert(`خطأ في الحذف: ${error.message}`);
    },
  });

  // AI Question mutation
  const aiMutation = useMutation({
    mutationFn: (prompt: string) =>
      apiRequest("/api/ai", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      }),
    onSuccess: (data) => {
      alert(data.text);
    },
    onError: (error) => {
      alert(`خطأ: ${error.message}`);
    },
  });

  const handleSubmit = (product: InsertProduct) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, product });
    } else {
      createMutation.mutate(product);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAskAI = () => {
    const question = prompt("اسأل الـ AI (مثال: سعر سلك نحاس تركي كام؟ او اقترح سعر بيع لـ بطارية AAA نسبة 20%)");
    if (question) {
      aiMutation.mutate(question);
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "myStock":
        return "بضاعتي";
      case "shortages":
        return "النواقص";
      case "marketCompare":
        return "مقارنات السوق";
      case "bestSellers":
        return "الأكثر مبيعًا";
      default:
        return "بضاعتي";
    }
  };

  return (
    <section className="flex-1 card overflow-hidden">
      {/* Top Controls */}
      <div className="flex gap-2 items-center mb-4">
        <button
          data-testid="button-add-product"
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          أضف صنف جديد
        </button>
        
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
          <input
            data-testid="input-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن صنف..."
            className="form-input pr-10"
          />
        </div>
        
        <button
          data-testid="button-ask-ai"
          onClick={handleAskAI}
          disabled={aiMutation.isPending}
          className="btn-secondary flex items-center gap-2"
        >
          <Bot size={18} />
          {aiMutation.isPending ? "جاري السؤال..." : "اسأل الـ AI"}
        </button>
      </div>

      {/* Content Area */}
      <div className="h-[calc(100%-80px)] overflow-auto">
        <h2 className="text-xl font-bold text-gold mb-4">{getTabTitle()}</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse-gold text-gold">جاري التحميل...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-text-muted py-8">
            {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد أصناف"}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmit}
        product={editingProduct}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </section>
  );
}