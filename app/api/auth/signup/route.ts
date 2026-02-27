import { created, fail, parseJson } from "@/lib/http";
import { users } from "@/lib/mock-db";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = { email: string; password: string; name?: string };

export async function POST(req: Request) {
  const body = await parseJson<Body>(req).catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password ?? "";
  const name = body?.name?.trim();

  if (!email || !password) {
    return fail("INVALID_REQUEST", "email and password are required", 400);
  }

  if (!EMAIL_REGEX.test(email)) {
    return fail("INVALID_REQUEST", "Invalid email format", 400);
  }

  if (password.length < 8) {
    return fail("INVALID_REQUEST", "Password must be at least 8 characters", 400);
  }

  if (users.has(email)) {
    return fail("INVALID_REQUEST", "Email already exists", 409);
  }

  const user = {
    id: `user_${Math.random().toString(16).slice(2, 10)}`,
    email,
    name: name || undefined,
    role: "USER" as const,
  };

  users.set(email, { user, password });

  return created({ user });
}
