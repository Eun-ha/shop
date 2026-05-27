// app/api/checkout/route.ts
import { created, fail, parseJson } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CartItem } from "@/lib/cart";
import type { ShippingAddress } from "@/lib/order";
import { calcSubtotalAmount, toOrderDto, toOrderItemCreateData } from "@/lib/order";

type Body = {
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
  note?: string;
};

export async function POST(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const body = await parseJson<Body>(req).catch(() => null);
  if (!body?.items?.length || !body?.shippingAddress) {
    return fail("INVALID_REQUEST", "items and shippingAddress are required", 400);
  }

  const orderItems: CartItem[] = [];

  for (const it of body.items) {
    const qty = Math.max(1, Math.min(99, Number(it.quantity || 0)));

    if (!it.productId || !qty) {
      return fail("INVALID_REQUEST", "Each item needs productId and quantity", 400);
    }

    const p = await prisma.product.findUnique({ where: { id: it.productId } });

    if (!p) {
      return fail("PRODUCT_NOT_FOUND", "Product not found.", 404, { productId: it.productId });
    }

    if (p.status !== "ACTIVE") {
      return fail("PRODUCT_UNAVAILABLE", "Product is not for sale.", 409, { productId: it.productId });
    }

    if (p.stock < qty) {
      return fail("OUT_OF_STOCK", "Insufficient stock.", 409, { productId: it.productId, stock: p.stock });
    }

    const price = { amount: p.priceAmount, currency: "KRW" as const };
    orderItems.push({
      itemId: `checkoutitem_${Math.random().toString(16).slice(2)}`,
      productId: p.id,
      name: p.name,
      price,
      quantity: qty,
      lineTotal: { ...price, amount: p.priceAmount * qty },
    });
  }

  const order = await prisma.$transaction(async tx => {
    const createdOrder = await tx.order.create({
      data: {
        userId: auth.sub,
        subtotalAmount: calcSubtotalAmount(orderItems),
        shippingName: body.shippingAddress.name,
        shippingPhone: body.shippingAddress.phone,
        shippingAddress1: body.shippingAddress.address1,
        shippingAddress2: body.shippingAddress.address2 ?? null,
        shippingCity: body.shippingAddress.city,
        shippingPostalCode: body.shippingAddress.postalCode,
        items: {
          create: toOrderItemCreateData(orderItems),
        },
      },
      include: { items: true },
    });

    for (const it of body.items) {
      await tx.product.update({
        where: { id: it.productId },
        data: {
          stock: {
            decrement: Math.max(1, Math.min(99, Number(it.quantity || 0))),
          },
        },
      });
    }

    return createdOrder;
  });

  return created({ order: toOrderDto(order) });
}
