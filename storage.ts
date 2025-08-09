import { Product, InsertProduct, UpdateProduct } from "../shared/schema.js";

export interface IStorage {
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(
    id: string,
    product: Partial<InsertProduct>,
  ): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
}

// In-memory storage implementation
class MemStorage implements IStorage {
  private products: Map<string, Product> = new Map();
  private idCounter = 1;

  constructor() {
    // Add some sample data for testing
    this.seedData();
  }

  private seedData() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "سلك نحاس تركي 2.5 مم",
        purchasePrice: 15.5,
        sellPrice: 18.6,
        qty: 100,
        img: "https://via.placeholder.com/150",
      },
      {
        name: "بطارية AAA دوراسيل",
        purchasePrice: 2.25,
        sellPrice: 3.0,
        qty: 50,
        img: "https://via.placeholder.com/150",
      },
      {
        name: "مصباح LED 9 واط",
        purchasePrice: 8.0,
        sellPrice: 12.0,
        qty: 25,
        img: "https://via.placeholder.com/150",
      },
      {
        name: "كابل USB نوع C",
        purchasePrice: 5.75,
        sellPrice: 8.5,
        qty: 30,
        img: "https://via.placeholder.com/150",
      },
    ];

    sampleProducts.forEach((product) => {
      const id = this.generateId();
      const fullProduct: Product = {
        ...product,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.products.set(id, fullProduct);
    });
  }

  private generateId(): string {
    return (this.idCounter++).toString();
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.generateId();
    const fullProduct: Product = {
      ...product,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, fullProduct);
    return fullProduct;
  }

  async updateProduct(
    id: string,
    updates: Partial<InsertProduct>,
  ): Promise<Product | null> {
    const existing = this.products.get(id);
    if (!existing) return null;

    const updated: Product = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter((product) =>
      product.name.toLowerCase().includes(lowercaseQuery),
    );
  }
}

export const storage: IStorage = new MemStorage();
