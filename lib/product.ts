export type ProductStatus = "ACTIVE" | "INACTIVE" | "SOLD_OUT";

export type Money = { amount: number; currency: "KRW" };

export type Product = {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  images?: string[];
  price: Money;
  compareAtPrice?: Money | null;
  category?: string;
  tags?: string[];
  stock: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  images: string[];
  priceAmount: number;
  compareAtPriceAmount: number | null;
  category: string | null;
  tags: string[];
  stock: number;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
};

export function toProductDto(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    thumbnailUrl: row.thumbnailUrl ?? undefined,
    images: row.images,
    price: { amount: row.priceAmount, currency: "KRW" },
    compareAtPrice:
      row.compareAtPriceAmount === null
        ? null
        : {
            amount: row.compareAtPriceAmount,
            currency: "KRW",
          },
    category: row.category ?? undefined,
    tags: row.tags,
    stock: row.stock,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
