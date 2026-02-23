import { ok, fail } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { orders } from "@/lib/mock-db";

export async function GET(req: Request, ctx: { params: { orderId: string } }) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const order = orders.get(ctx.params.orderId);
  if (!order || order.userId !== auth.sub) return fail("ORDER_NOT_FOUND", "Order not found.", 404);

  return ok(order);
}