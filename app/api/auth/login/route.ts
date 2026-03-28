import { parseJson, fail, ok } from "@/lib/http";
import { findUserByEmail, signAccessToken, ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_MAX_AGE, toPublicUser } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

type Body = { email: string; password: string };

export async function POST(req: Request) {
  const body = await parseJson<Body>(req).catch(() => null);
  if (!body?.email || !body?.password) {
    return fail("INVALID_REQUEST", "email and password are required", 400);
  }

  const user = await findUserByEmail(body.email);

  if (!user || !verifyPassword(body.password, user.passwordHash)) {
    return fail("UNAUTHORIZED", "Invalid credentials", 401);
  }

  const accessToken = signAccessToken(user);
  const response = ok({ user: toPublicUser(user) });
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  return response;
}
