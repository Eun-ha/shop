import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

type DbUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 2;

export type AuthPayload = { sub: string; email: string; role: "USER" | "ADMIN" };

function normalizeRole(role: string): "USER" | "ADMIN" {
  return role === "ADMIN" ? "ADMIN" : "USER";
}

export function toPublicUser(user: DbUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? undefined,
    role: normalizeRole(user.role),
  };
}

export function signAccessToken(user: DbUser) {
  const payload: AuthPayload = { sub: user.id, email: user.email, role: normalizeRole(user.role) };
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

export function getCookieToken(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = cookieHeader.split(";").map((part) => part.trim());
  const tokenCookie = cookies.find((cookie) => cookie.startsWith(`${ACCESS_TOKEN_COOKIE}=`));
  if (!tokenCookie) return null;

  const encodedToken = tokenCookie.slice(`${ACCESS_TOKEN_COOKIE}=`.length);
  if (!encodedToken) return null;

  return decodeURIComponent(encodedToken);
}

export function requireAuth(req: Request) {
  const token = getBearerToken(req) || getCookieToken(req);
  if (!token) return null;
  return verifyAccessToken(token);
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
