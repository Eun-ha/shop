import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/product";
import { Card } from "@/components/ui/Card";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
    >
      <Card className="flex h-full flex-col gap-2 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <Image
          src={product.thumbnailUrl || "/placeholder.png"}
          alt={product.name}
          width={300}
          height={300}
          className="h-60 w-full rounded-xl bg-surface-variant object-cover"
          unoptimized
        />
        <div className="mt-2 flex flex-col gap-1">
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
      </Card>
    </Link>
  );
}
