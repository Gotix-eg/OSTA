import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;

  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, hashedValue] = storedHash.split(":");

  if (!salt || !hashedValue) {
    return false;
  }

  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const hashedBuffer = Buffer.from(hashedValue, "hex");

  if (derived.length !== hashedBuffer.length) {
    return false;
  }

  return timingSafeEqual(derived, hashedBuffer);
}
