import { Edit, Trash2 } from "lucide-react";
import { Product } from "../../../shared/schema";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const handleDelete = () => {
    if (confirm("متأكد تحذف الصنف؟")) {
      onDelete(product.id);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 border-b border-border-secondary last:border-b-0">
      <img
        src={product.img || "https://via.placeholder.com/150"}
        alt={product.name}
        className="w-18 h-18 object-cover rounded-lg border-2 border-border-secondary"
      />
      
      <div className="flex-1 text-right">
        <div className="text-lg font-bold text-gold">{product.name}</div>
        <div className="text-text-muted mt-1 flex gap-3 items-center text-sm">
          <div>سعر البيع: <strong className="text-white">{product.sellPrice.toFixed(2)}</strong> ج</div>
          <div>الكمية: <span className="text-white">{product.qty}</span></div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          data-testid={`button-edit-${product.id}`}
          onClick={() => onEdit(product)}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          title="تعديل"
        >
          <Edit size={16} />
        </button>
        <button
          data-testid={`button-delete-${product.id}`}
          onClick={handleDelete}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          title="حذف"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}