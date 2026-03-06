"use client";

import { useMemo, useState } from "react";
import AddToCartButton from "./AddToCartButton";
import BuyNowButton from "./BuyNowButton";

interface PurchaseActionsProps {
  productId: string;
  stock: number;
}

export default function PurchaseActions({ productId, stock }: PurchaseActionsProps) {
  const maxQuantity = useMemo(() => Math.max(1, stock), [stock]);
  const [quantity, setQuantity] = useState(1);

  const clampQuantity = (value: number) => {
    if (Number.isNaN(value)) return 1;
    return Math.min(Math.max(1, value), maxQuantity);
  };

  const handleQuantityChange = (value: string) => {
    setQuantity(clampQuantity(Number.parseInt(value, 10)));
  };

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">수량</span>
        <div className="inline-flex items-center rounded border border-zinc-300 dark:border-zinc-700">
          <button
            type="button"
            className="h-10 w-10 text-lg text-zinc-700 hover:bg-zinc-100 disabled:text-zinc-300 dark:text-zinc-200 dark:hover:bg-zinc-800"
            onClick={() => setQuantity((prev) => clampQuantity(prev - 1))}
            disabled={quantity <= 1}
            aria-label="수량 감소"
          >
            -
          </button>
          <input
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className="h-10 w-16 border-x border-zinc-300 bg-white text-center text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            aria-label="구매 수량"
          />
          <button
            type="button"
            className="h-10 w-10 text-lg text-zinc-700 hover:bg-zinc-100 disabled:text-zinc-300 dark:text-zinc-200 dark:hover:bg-zinc-800"
            onClick={() => setQuantity((prev) => clampQuantity(prev + 1))}
            disabled={quantity >= maxQuantity}
            aria-label="수량 증가"
          >
            +
          </button>
        </div>
        <span className="text-xs text-zinc-500">최대 {maxQuantity}개</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <BuyNowButton productId={productId} quantity={quantity} />
        <AddToCartButton productId={productId} quantity={quantity} />
      </div>
    </div>
  );
}
