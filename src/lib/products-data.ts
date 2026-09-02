export type ProductStatus = "Active" | "Draft" | "Out of Stock";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  status: ProductStatus;
  image?: string;
  createdAt: string;
};
