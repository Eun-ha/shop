-- CreateTable
CREATE TABLE "BuyNowIntent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyNowIntent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BuyNowIntent_userId_createdAt_idx" ON "BuyNowIntent"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "BuyNowIntent_productId_idx" ON "BuyNowIntent"("productId");

-- AddForeignKey
ALTER TABLE "BuyNowIntent" ADD CONSTRAINT "BuyNowIntent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
