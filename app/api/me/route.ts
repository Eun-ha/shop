import { ok, fail } from "@/lib/http";
import { requireAuth, findUserById, toPublicUser } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const user = await findUserById(auth.sub);
  if (!user) return fail("UNAUTHORIZED", "Unauthorized", 401);

  return ok(toPublicUser(user));
}
