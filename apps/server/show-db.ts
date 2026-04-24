import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔌 Current database connection:\n");
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 60) + '...' : 'NOT SET'}`);
  console.log(`DATABASE_URL_UNPOOLED: ${process.env.DATABASE_URL_UNPOOLED ? 'SET' : 'NOT SET'}`);
  console.log(`DATABASE_POSTGRES_URL: ${process.env.DATABASE_POSTGRES_URL ? 'SET' : 'NOT SET'}`);
  
  try {
    await prisma.$connect();
    const res = await prisma.$queryRaw`SELECT current_database(), current_setting('search_path') as schema`;
    console.log(`\n✅ Connected to database: ${res[0].current_database}`);
    console.log(`   Schema: ${res[0].schema}`);
    
    // Show connection string details (host only)
    const url = new URL(process.env.DATABASE_URL || "");
    console.log(`   Host: ${url.host}`);
    console.log(`   Port: ${url.port}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => console.error(e));
