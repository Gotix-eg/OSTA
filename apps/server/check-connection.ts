import "dotenv/config";
import { PrismaClient } from "@prisma/client";

console.log("🔌 Environment variables:");
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0,50)+'...' : 'NOT SET'}`);
console.log(`DATABASE_URL_UNPOOLED: ${process.env.DATABASE_URL_UNPOOLED ? process.env.DATABASE_URL_UNPOOLED.substring(0,50)+'...' : 'NOT SET'}`);
console.log(`DATABASE_POSTGRES_URL: ${process.env.DATABASE_POSTGRES_URL ? 'SET' : 'NOT SET'}`);

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("\n✅ Connected to database.");
    console.log(`   URL: ${(prisma as any)._engine._connectionString?.substring(0, 80)}...`);
    
    const res = await prisma.$queryRaw`SELECT current_database(), current_schema()`;
    console.log(`   Database: ${res[0].current_database} | Schema: ${res[0].current_schema}`);
  } catch (e: any) {
    console.error("\n❌ Connection error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
