import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="flex flex-col gap-2 rounded-lg border border-outline bg-surface p-4 shadow-sm transition hover:shadow-md">
        <Image
          src={product.thumbnailUrl || "/placeholder.png"}
          alt={product.name}
          width={300}
          height={300}
          className="h-60 w-full rounded-md bg-surface-variant object-cover"
          unoptimized
        />
        <div className="flex flex-col gap-1 mt-2">
          <span className="text-lg font-semibold text-on-surface">
            {product.name}
          </span>
          <span className="min-h-[2.5em] line-clamp-2 text-sm text-on-surface/70">
            {product.description}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-bold text-sale">
              {product.price.amount.toLocaleString()}원
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-on-surface/50 line-through">
                {product.compareAtPrice.amount.toLocaleString()}원
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
