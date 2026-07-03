import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { prisma } from "../lib/prisma.js";
import crypto from 'crypto';

async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

async function main() {
  const newPassword = "Osta@2026Admin";
  const passwordHash = await hashPassword(newPassword);

  await prisma.user.updateMany({
    where: { email: "admin@osta.eg" },
    data: { passwordHash }
  });

  console.log(`Successfully reset admin password for admin@osta.eg to: ${newPassword}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
