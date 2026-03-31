import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@yattoku.local";
  const adminPassword = "admin123456";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const allowedDomain = await prisma.allowedEmailDomain.upsert({
    where: {
      domain: "osaka-ue.ac.jp",
    },
    update: {
      isActive: true,
    },
    create: {
      domain: "osaka-ue.ac.jp",
      isActive: true,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      nickname: "Yattoku Admin",
      role: "admin",
      emailVerified: true,
      passwordHash: adminPasswordHash,
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      nickname: "Yattoku Admin",
      role: "admin",
      emailVerified: true,
    },
  });

  const sampleEvent = await prisma.event.upsert({
    where: {
      id: 1n,
    },
    update: {
      title: "ヤットク交流イベント",
      description: "ヤットクMVP確認用のサンプルイベントです。",
      eventDate: new Date("2026-04-20T18:00:00+09:00"),
      place: "大阪経済大学 A館101",
      publishStatus: "published",
      applicationStatus: "open",
      createdBy: adminUser.id,
    },
    create: {
      id: 1n,
      title: "ヤットク交流イベント",
      description: "ヤットクMVP確認用のサンプルイベントです。",
      eventDate: new Date("2026-04-20T18:00:00+09:00"),
      place: "大阪経済大学 A館101",
      publishStatus: "published",
      applicationStatus: "open",
      createdBy: adminUser.id,
    },
  });

  console.log("seed completed");
  console.log({
    allowedDomain: {
      id: allowedDomain.id.toString(),
      domain: allowedDomain.domain,
    },
    adminUser: {
      id: adminUser.id.toString(),
      email: adminUser.email,
      password: adminPassword,
    },
    sampleEvent: {
      id: sampleEvent.id.toString(),
      title: sampleEvent.title,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
