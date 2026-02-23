import jwt from "jsonwebtoken";
import { users } from "./mock-db";
import type { User } from "./mock-db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export type AuthPayload = { sub: string; email: string; role: "USER" | "ADMIN" };

export function signAccessToken(user: User) {
  const payload: AuthPayload = { sub: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
}

export function verifyAccessToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function getBearerToken(req: Request) {
  const h = req.headers.get("authorization") || "";
  const [type, token] = h.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export function requireAuth(req: Request) {
  const token = getBearerToken(req);
  if (!token) return null;
  return verifyAccessToken(token);
}

export function findUserByEmail(email: string) {
  return users.get(email) ?? null;
}
