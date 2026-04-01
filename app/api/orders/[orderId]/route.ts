import { ok, fail } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toOrderDto } from "@/lib/order";

export async function GET(req: Request, ctx: { params: Promise<{ orderId: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const params = await ctx.params;
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { items: true },
  });
  if (!order || order.userId !== auth.sub) return fail("ORDER_NOT_FOUND", "Order not found.", 404);

  return ok(toOrderDto(order));
}
