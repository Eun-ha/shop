const { PrismaClient } = require("@prisma/client");
const { randomBytes, scryptSync } = require("node:crypto");

const prisma = new PrismaClient({});
const KEY_LENGTH = 64;

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  await prisma.user.upsert({
    where: { email: "dev@example.com" },
    update: {
      name: "Dev",
      role: "USER",
    },
    create: {
      id: "user_01",
      email: "dev@example.com",
      name: "Dev",
      passwordHash: hashPassword("password1234"),
      role: "USER",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      name: "Admin",
      role: "ADMIN",
    },
    create: {
      id: "user_admin",
      email: "admin@example.com",
      name: "Admin",
      passwordHash: hashPassword("password1234"),
      role: "ADMIN",
    },
  });
}

main()
  .catch((error) => {
    console.error("Failed to seed database", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
