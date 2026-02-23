import { ok, fail } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { users } from "@/lib/mock-db";

export async function GET(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const record = users.get(auth.email);
  if (!record) return fail("UNAUTHORIZED", "Unauthorized", 401);

  return ok(record.user);
}