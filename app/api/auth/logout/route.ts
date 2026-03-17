import { ok } from "@/lib/http";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";

export async function POST() {
  const response = ok({ success: true });
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
