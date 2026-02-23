import { parseJson, fail, ok } from "@/lib/http";
import { findUserByEmail } from "@/lib/auth";
import { signAccessToken } from "@/lib/auth";

type Body = { email: string; password: string };

export async function POST(req: Request) {
  const body = await parseJson<Body>(req).catch(() => null);
  if (!body?.email || !body?.password) {
    return fail("INVALID_REQUEST", "email and password are required", 400);
  }

  const record = findUserByEmail(body.email);
  if (!record || record.password !== body.password) {
    return fail("UNAUTHORIZED", "Invalid credentials", 401);
  }

  const accessToken = signAccessToken(record.user);
  return ok({ accessToken, user: record.user });
}