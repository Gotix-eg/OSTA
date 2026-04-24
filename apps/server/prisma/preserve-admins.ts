import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  // ── 1. Fetch and backup admin accounts ────────────────────────────────────
  console.log("🔍 Finding admin and super_admin accounts...\n");

  const adminUsers = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    include: {
      clientProfile: true,
      workerProfile: true,
      vendorProfile: true,
      addresses: true,
      sessions: true,
      otpCodes: true,
      notifications: true,
      walletTransactions: true,
      sentMessages: true,
      receivedMessages: true,
    },
  });

  if (adminUsers.length === 0) {
    console.log("⚠️  No admin or super_admin users found in database. Exiting.");
    process.exit(0);
  }

  console.log(`✅ Found ${adminUsers.length} admin/super_admin account(s):`);

  // Create backup directory
  const backupDir = path.join(process.cwd(), "admin-backup");
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  // Save full admin data as JSON (for potential future restore)
  const adminData = adminUsers.map(admin => ({
    id: admin.id,
    email: admin.email,
    phone: admin.phone,
    passwordHash: admin.passwordHash,
    role: admin.role,
    status: admin.status,
    firstName: admin.firstName,
    lastName: admin.lastName,
    avatarUrl: admin.avatarUrl,
    emailVerified: admin.emailVerified,
    phoneVerified: admin.phoneVerified,
    preferredLanguage: admin.preferredLanguage,
    lastLoginAt: admin.lastLoginAt,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
    clientProfile: admin.clientProfile,
    workerProfile: admin.workerProfile,
    vendorProfile: admin.vendorProfile,
    addresses: admin.addresses,
    sessions: admin.sessions.map(s => ({ id: s.id, refreshToken: s.refreshToken, expiresAt: s.expiresAt, createdAt: s.createdAt })),
    otpCodes: admin.otpCodes.map(o => ({ id: o.id, code: o.code, type: o.type, expiresAt: o.expiresAt, isUsed: o.isUsed, createdAt: o.createdAt })),
    notifications: admin.notifications.map(n => ({ id: n.id, type: n.type, title: n.title, body: n.body, data: n.data, isRead: n.isRead, readAt: n.readAt, createdAt: n.createdAt })),
    walletTransactions: admin.walletTransactions.map(w => ({ id: w.id, type: w.type, amount: w.amount, balance: w.balance, description: w.description, referenceId: w.referenceId, createdAt: w.createdAt })),
    sentMessages: admin.sentMessages.map(m => ({ id: m.id, receiverId: m.receiverId, requestId: m.requestId, content: m.content, type: m.type, attachments: m.attachments, isRead: m.isRead, readAt: m.readAt, createdAt: m.createdAt })),
    receivedMessages: admin.receivedMessages.map(m => ({ id: m.id, senderId: m.senderId, requestId: m.requestId, content: m.content, type: m.type, attachments: m.attachments, isRead: m.isRead, readAt: m.readAt, createdAt: m.createdAt })),
  }));

  fs.writeFileSync(path.join(backupDir, "admin-users.json"), JSON.stringify(adminData, null, 2));
  console.log(`   JSON backup saved to: ${path.join(backupDir, "admin-users.json")}`);

  // Save a readable CSV of admins
  const csvHeader = "ID,Email,Phone,Role,Status,FirstName,LastName,CreatedAt\n";
  const csvRows = adminUsers.map(a =>
    `${a.id},"${a.email || ''}","${a.phone}","${a.role}","${a.status}","${a.firstName}","${a.lastName}","${a.createdAt}"`
  ).join("\n");
  fs.writeFileSync(path.join(backupDir, "admin-users.csv"), csvHeader + csvRows);
  console.log(`   CSV backup saved to: ${path.join(backupDir, "admin-users.csv")}`);

  // Display admin list
  adminUsers.forEach((admin, idx) => {
    console.log(`   ${idx + 1}. ${admin.firstName} ${admin.lastName} (${admin.role}) - ${admin.email || admin.phone}`);
  });

  // ── 2. Wipe ALL data ───────────────────────────────────────────────────────
  console.log("\n⚠️  Wiping ALL data from the database...\n");

  const counts: Record<string, number> = {};

  // Helper to delete and record count
  const del = async (op: Promise<any>, name: string) => {
    const res = await op;
    counts[name] = res.count;
  };

  // Order mirrors reset-all.ts to satisfy FK constraints

  // 1. Deepest leaf tables
  await del(prisma.requestStatusHistory.deleteMany(), "requestStatusHistory");
  await del(prisma.requestOffer.deleteMany(), "requestOffer");
  await del(prisma.invoice.deleteMany(), "invoice");
  await del(prisma.warranty.deleteMany(), "warranty");
  await del(prisma.complaint.deleteMany(), "complaint");
  await del(prisma.review.deleteMany(), "review");
  await del(prisma.payment.deleteMany(), "payment");
  await del(prisma.serviceRequest.deleteMany(), "serviceRequest");

  // 2. Vendor sub-tables
  await del(prisma.directOrderItem.deleteMany(), "directOrderItem");
  await del(prisma.directOrder.deleteMany(), "directOrder");
  await del(prisma.customRequest.deleteMany(), "customRequest");
  await del(prisma.vendorProduct.deleteMany(), "vendorProduct");

  // 3. Material request system
  await del(prisma.materialOrder.deleteMany(), "materialOrder");
  await del(prisma.materialOffer.deleteMany(), "materialOffer");
  await del(prisma.materialRequest.deleteMany(), "materialRequest");

  // 4. Worker sub-tables
  await del(prisma.workerSpecialization.deleteMany(), "workerSpecialization");
  await del(prisma.workerArea.deleteMany(), "workerArea");
  await del(prisma.workSchedule.deleteMany(), "workSchedule");
  await del(prisma.portfolioItem.deleteMany(), "portfolioItem");
  await del(prisma.workerBadge.deleteMany(), "workerBadge");
  await del(prisma.workerTool.deleteMany(), "workerTool");
  await del(prisma.bankAccount.deleteMany(), "bankAccount");
  await del(prisma.favoriteWorker.deleteMany(), "favoriteWorker");

  // 5. Misc tables
  await del(prisma.notification.deleteMany(), "notification");
  await del(prisma.message.deleteMany(), "message");
  await del(prisma.walletTransaction.deleteMany(), "walletTransaction");
  await del(prisma.adCampaign.deleteMany(), "adCampaign");

  // 6. Sessions & OTP
  await del(prisma.session.deleteMany(), "session");
  await del(prisma.otpCode.deleteMany(), "otpCode");

  // 7. Profiles (cascade from User, but explicit delete harmless)
  await del(prisma.clientProfile.deleteMany(), "clientProfile");
  await del(prisma.workerProfile.deleteMany(), "workerProfile");
  await del(prisma.vendorProfile.deleteMany(), "vendorProfile");

  // 8. Addresses
  await del(prisma.address.deleteMany(), "address");

  // 9. User (last, everything cascades from here)
  await del(prisma.user.deleteMany(), "user");

  // 10. System tables
  await del(prisma.promotion.deleteMany(), "promotion");
  await del(prisma.area.deleteMany(), "area");
  await del(prisma.systemSetting.deleteMany(), "systemSetting");
  await del(prisma.auditLog.deleteMany(), "auditLog");

  console.log("✅ Database wiped! Deleted rows per table:");
  for (const [table, count] of Object.entries(counts)) {
    if (count > 0) console.log(`   ${table}: ${count}`);
  }

  // ── 3. Restore admin accounts ──────────────────────────────────────────────
  console.log("\n🔁 Restoring admin accounts...\n");

  const adminIds = new Set(adminUsers.map(a => a.id));
  let restored = 0;

  // Insert users first
  for (const admin of adminUsers) {
    await prisma.user.create({
      data: {
        id: admin.id,
        email: admin.email,
        phone: admin.phone,
        passwordHash: admin.passwordHash,
        role: admin.role,
        status: admin.status,
        firstName: admin.firstName,
        lastName: admin.lastName,
        avatarUrl: admin.avatarUrl,
        emailVerified: admin.emailVerified,
        phoneVerified: admin.phoneVerified,
        preferredLanguage: admin.preferredLanguage,
        lastLoginAt: admin.lastLoginAt,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      } as any,
    });
    restored++;
  }
  console.log(`   Restored ${restored} user(s).`);

  // Insert profiles, addresses, sessions, otpCodes, notifications, walletTransactions
  for (const admin of adminUsers) {
    if (admin.clientProfile) {
      await prisma.clientProfile.create({ data: { ...admin.clientProfile, userId: admin.id } as any });
    }
    if (admin.workerProfile) {
      await prisma.workerProfile.create({ data: { ...admin.workerProfile, userId: admin.id } as any });
    }
    if (admin.vendorProfile) {
      await prisma.vendorProfile.create({ data: { ...admin.vendorProfile, userId: admin.id } as any });
    }
    if (admin.addresses) {
      for (const addr of admin.addresses) {
        await prisma.address.create({ data: { ...addr, userId: admin.id } as any });
      }
    }
    if (admin.sessions) {
      for (const s of admin.sessions) {
        await prisma.session.create({ data: { ...s, userId: admin.id } as any });
      }
    }
    if (admin.otpCodes) {
      for (const o of admin.otpCodes) {
        await prisma.otpCode.create({ data: { ...o, userId: admin.id } as any });
      }
    }
    if (admin.notifications) {
      for (const n of admin.notifications) {
        await prisma.notification.create({ data: { ...n, userId: admin.id } as any });
      }
    }
    if (admin.walletTransactions) {
      for (const w of admin.walletTransactions) {
        await prisma.walletTransaction.create({ data: { ...w, userId: admin.id } as any });
      }
    }
  }
  console.log("   Restored profiles, addresses, sessions, OTPs, notifications, wallet transactions.");

  // Insert messages – only those where both sender and receiver are admins
  const allMessages = new Map<string, any>();
  for (const admin of adminUsers) {
    for (const msg of admin.sentMessages || []) {
      if (adminIds.has(msg.receiverId)) allMessages.set(msg.id, msg);
    }
    for (const msg of admin.receivedMessages || []) {
      if (adminIds.has(msg.senderId)) allMessages.set(msg.id, msg);
    }
  }
  for (const msg of allMessages.values()) {
    await prisma.message.create({
      data: {
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        requestId: msg.requestId,
        content: msg.content,
        type: msg.type,
        attachments: msg.attachments,
        isRead: msg.isRead,
        readAt: msg.readAt,
        createdAt: msg.createdAt,
      } as any,
    });
  }
  console.log(`   Restored ${allMessages.size} message(s).`);

  console.log("\n🎉 Done. Admin accounts and their core data have been restored.");
  console.log(`   Backup files are in: ${backupDir}`);
  console.log("   You can safely use the admin credentials from the CSV/JSON files.\n");
}

main()
  .catch((e) => {
    console.error("❌ Operation failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
