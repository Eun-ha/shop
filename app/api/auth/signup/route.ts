import { created, fail, parseJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { toPublicUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";

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

  if (!process.env.DATABASE_URL) {
    return fail(
      "INTERNAL_ERROR",
      "Server database is not configured. Set DATABASE_URL in the deployment environment.",
      500,
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return fail("INVALID_REQUEST", "Email already exists", 409);
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash: hashPassword(password),
        role: "USER",
      },
    });

    return created({ user: toPublicUser(user) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("INVALID_REQUEST", "Email already exists", 409);
    }

    return fail(
      "INTERNAL_ERROR",
      "Failed to create user. Check database connection and Prisma migrations on the server.",
      500,
    );
  }
}
