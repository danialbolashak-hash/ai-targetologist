// Promote a user to ADMIN by email.
// Usage: node scripts/make-admin.mjs your@email.com
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

// load DATABASE_URL from .env.local
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^DATABASE_URL=["']?(.+?)["']?\s*$/);
    if (m) process.env.DATABASE_URL = m[1];
  }
} catch {}

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/make-admin.mjs your@email.com");
  process.exit(1);
}

const prisma = new PrismaClient();
const user = await prisma.user.update({
  where: { email },
  data: { role: "ADMIN" },
}).catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});

console.log(`✅ ${user.email} теперь ADMIN`);
await prisma.$disconnect();
