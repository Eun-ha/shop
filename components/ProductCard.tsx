import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/mock-db";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="border rounded-lg shadow-sm bg-white dark:bg-zinc-900 p-4 flex flex-col gap-2 hover:shadow-md transition">
        <Image
          src={product.thumbnailUrl || "/placeholder.png"}
          alt={product.name}
          width={300}
          height={300}
          className="rounded-md object-cover w-full h-60 bg-zinc-100"
          unoptimized
        />
        <div className="flex flex-col gap-1 mt-2">
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {product.name}
          </span>
          <span className="text-zinc-500 text-sm line-clamp-2 min-h-[2.5em]">
            {product.description}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-bold text-blue-600">
              {product.price.amount.toLocaleString()}원
            </span>
            {product.compareAtPrice && (
              <span className="text-xs line-through text-zinc-400">
                {product.compareAtPrice.amount.toLocaleString()}원
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
