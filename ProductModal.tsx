import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { insertProductSchema, type InsertProduct, type Product } from "../../../shared/schema";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: InsertProduct) => void;
  product?: Product | null;
  isLoading?: boolean;
}

export default function ProductModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  product, 
  isLoading = false 
}: ProductModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: product ? {
      name: product.name,
      purchasePrice: product.purchasePrice,
      sellPrice: product.sellPrice,
      qty: product.qty,
      img: product.img || ""
    } : {
      name: "",
      purchasePrice: 0,
      sellPrice: 0,
      qty: 0,
      img: ""
    }
  });

  React.useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        purchasePrice: product.purchasePrice,
        sellPrice: product.sellPrice,
        qty: product.qty,
        img: product.img || ""
      });
    } else {
      reset({
        name: "",
        purchasePrice: 0,
        sellPrice: 0,
        qty: 0,
        img: ""
      });
    }
  }, [product, reset]);

  const handleFormSubmit = (data: InsertProduct) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-background-primary border border-border-primary rounded-xl p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gold">
            {product ? "تعديل صنف" : "أضف صنف"}
          </h3>
          <button
            data-testid="button-close-modal"
            onClick={handleClose}
            className="text-text-muted hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              اسم الصنف
            </label>
            <input
              data-testid="input-product-name"
              {...register("name")}
              className="form-input"
              placeholder="أدخل اسم الصنف"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              سعر الشراء (عليّا)
            </label>
            <input
              data-testid="input-purchase-price"
              {...register("purchasePrice", { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="form-input"
              placeholder="0.00"
            />
            {errors.purchasePrice && (
              <p className="text-red-400 text-sm mt-1">{errors.purchasePrice.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              سعر البيع (للزبون)
            </label>
            <input
              data-testid="input-sell-price"
              {...register("sellPrice", { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="form-input"
              placeholder="0.00"
            />
            {errors.sellPrice && (
              <p className="text-red-400 text-sm mt-1">{errors.sellPrice.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              الكمية
            </label>
            <input
              data-testid="input-quantity"
              {...register("qty", { valueAsNumber: true })}
              type="number"
              className="form-input"
              placeholder="0"
            />
            {errors.qty && (
              <p className="text-red-400 text-sm mt-1">{errors.qty.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              رابط صورة (اختياري)
            </label>
            <input
              data-testid="input-image-url"
              {...register("img")}
              className="form-input"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              data-testid="button-cancel"
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button
              data-testid="button-save"
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}