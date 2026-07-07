import type { UserRole } from "@prisma/client";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";

import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/tokens.js";
import { sendPasswordResetEmail, sendWelcomeEmail, sendVerificationEmail } from "../../utils/email.js";

export type RegisterInput = {
  role: "CLIENT" | "WORKER" | "VENDOR";
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  governorate?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  shopName?: string;
  nationalIdNumber?: string;
  nationalIdFront?: string;
  nationalIdBack?: string;
  commercialRecord?: string;
  taxCard?: string;
  profession?: string;
  avatarUrl?: string;
};

type LoginInput = {
  phone: string;
  password: string;
};

const OTP_HASH_PREFIX = "sha256:";

function generateOtpCode() {
  return randomInt(100000, 1000000).toString();
}

function hashOtpCode(userId: string, type: string, code: string) {
  const secret = process.env.JWT_SECRET || "local-otp-secret";
  const digest = createHash("sha256")
    .update(`${userId}:${type}:${code}:${secret}`)
    .digest("hex");

  return `${OTP_HASH_PREFIX}${digest}`;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function otpMatches(storedCode: string, userId: string, type: string, submittedCode: string) {
  if (storedCode.startsWith(OTP_HASH_PREFIX)) {
    return safeEqual(storedCode, hashOtpCode(userId, type, submittedCode));
  }

  // Legacy fallback for OTP rows created before hashing was introduced.
  return safeEqual(storedCode, submittedCode);
}

function toPublicUser(user: {
  id: string;
  role: UserRole;
  phone: string;
  email: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  preferredLanguage: string;
  status: string;
  clientProfile?: { totalRequests: number; walletBalance: number; isVip: boolean } | null;
  workerProfile?: { yearsOfExperience: number; rating: number; isAvailable: boolean } | null;
  vendorProfile?: { shopName: string; category: string | null; latitude: number | null; longitude: number | null } | null;
}) {
  return {
    id: user.id,
    role: user.role,
    phone: user.phone,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    preferredLanguage: user.preferredLanguage,
    status: user.status,
    profile:
      user.role === "CLIENT"
        ? user.clientProfile
        : user.role === "WORKER"
          ? user.workerProfile
          : user.role === "VENDOR"
            ? user.vendorProfile
            : null
  };
}

async function createSession(userId: string, role: UserRole) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      userId,
      refreshToken: crypto.randomUUID(),
      expiresAt
    }
  });

  const refreshToken = signRefreshToken({
    sub: userId,
    sessionId: session.id,
    type: "refresh"
  });

  await prisma.session.update({
    where: { id: session.id },
    data: { refreshToken }
  });

  const accessToken = signAccessToken({
    sub: userId,
    role,
    sessionId: session.id
  });

  return {
    sessionId: session.id,
    accessToken,
    refreshToken,
    expiresAt
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone: input.phone }, ...(input.email ? [{ email: input.email }] : [])]
      }
    });

    if (existingUser) {
      if (input.role === "WORKER" && existingUser.role === "CLIENT") {
        const isPasswordCorrect = await verifyPassword(input.password, existingUser.passwordHash);
        if (!isPasswordCorrect) {
          throw new ApiError(400, "رقم الهاتف مسجل بالفعل كعميل. يرجى إدخال كلمة المرور الصحيحة لربط حساب الفني الخاص بك.");
        }

        if (input.nationalIdNumber) {
          const existingWorker = await prisma.workerProfile.findUnique({
            where: { nationalIdNumber: input.nationalIdNumber }
          });
          if (existingWorker) {
            throw new ApiError(409, "الرقم القومي مسجل بالفعل لحساب آخر.", "NATIONAL_ID_EXISTS");
          }
        }

        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: "WORKER",
            avatarUrl: input.avatarUrl || existingUser.avatarUrl,
            workerProfile: {
              create: {
                nationalIdNumber: input.nationalIdNumber,
                nationalIdFront: input.nationalIdFront,
                nationalIdBack: input.nationalIdBack,
                profession: input.profession,
                yearsOfExperience: 0,
                rating: 0,
                ratingCount: 0,
                isAvailable: false,
                totalJobsCompleted: 0,
                totalEarnings: 0,
                walletBalance: 0,
                orderQuota: 0,
                subscriptionTier: "free",
                verificationStatus: "PENDING"
              }
            },
            ...(input.governorate && {
              addresses: {
                create: {
                  governorate: input.governorate,
                  city: input.city || "",
                  area: (input as any).district || input.city || "",
                  street: input.address || "",
                  isDefault: true
                }
              }
            })
          },
          include: {
            clientProfile: true,
            workerProfile: true,
            vendorProfile: true
          }
        });

        const tokens = await createSession(updatedUser.id, updatedUser.role);
        return {
          user: toPublicUser(updatedUser as any),
          ...tokens
        };
      }

      if (input.role === "VENDOR" && existingUser.role === "CLIENT") {
        const isPasswordCorrect = await verifyPassword(input.password, existingUser.passwordHash);
        if (!isPasswordCorrect) {
          throw new ApiError(400, "رقم الهاتف مسجل بالفعل كعميل. يرجى إدخال كلمة المرور الصحيحة لربط حساب المتجر الخاص بك.");
        }

        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: "VENDOR",
            avatarUrl: input.avatarUrl || existingUser.avatarUrl,
            vendorProfile: {
              create: {
                shopName: input.shopName || (input.firstName + " " + input.lastName),
                category: input.category || "",
                governorate: input.governorate || "cairo",
                city: input.city || "new-cairo",
                address: input.address || "",
                latitude: input.latitude || 30.0444,
                longitude: input.longitude || 31.2357,
                commercialRegisterUrl: input.commercialRecord,
                taxCardUrl: input.taxCard,
                rating: 0,
                ratingCount: 0,
                totalOrders: 0,
                totalEarnings: 0,
                walletBalance: 0,
                orderQuota: 0,
                isOpen: false,
                verificationStatus: "PENDING"
              }
            },
            ...(input.governorate && {
              addresses: {
                create: {
                  governorate: input.governorate,
                  city: input.city || "",
                  area: (input as any).district || input.city || "",
                  street: input.address || "",
                  isDefault: true
                }
              }
            })
          },
          include: {
            clientProfile: true,
            workerProfile: true,
            vendorProfile: true
          }
        });

        const tokens = await createSession(updatedUser.id, updatedUser.role);
        return {
          user: toPublicUser(updatedUser as any),
          ...tokens
        };
      }

      if (existingUser.phone === input.phone) {
        throw new ApiError(409, "رقم الهاتف مسجل بالفعل", "PHONE_EXISTS");
      }
      throw new ApiError(409, "البريد الإلكتروني مسجل بالفعل", "EMAIL_EXISTS");
    }

    if (input.role === "WORKER" && input.nationalIdNumber) {
      const existingWorker = await prisma.workerProfile.findUnique({
        where: { nationalIdNumber: input.nationalIdNumber }
      });
      if (existingWorker) {
        throw new ApiError(409, "الرقم القومي مسجل بالفعل", "NATIONAL_ID_EXISTS");
      }
    }

    const passwordHash = await hashPassword(input.password);

    // For clients: ensure address fields are properly mapped
    // The frontend sends governorate, city, district (as area), street
    const addressData = (input.governorate || input.latitude)
      ? {
          create: {
            governorate: input.governorate || "",
            city: input.city || "",
            area: (input as any).district || input.city || "", // Use district if provided, fallback to city
            street: input.address || "",
            latitude: input.latitude,
            longitude: input.longitude,
            isDefault: true
          }
        }
      : undefined;

    const user = await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        email: input.email,
        passwordHash,
        role: input.role,
        status: "ACTIVE",
        avatarUrl: input.avatarUrl,
        clientProfile:
          input.role === "CLIENT"
            ? {
                create: {
                  totalRequests: 0,
                  walletBalance: 0,
                  isVip: false
                }
              }
            : undefined,
        workerProfile:
          input.role === "WORKER"
            ? {
                create: {
                  nationalIdNumber: input.nationalIdNumber,
                  nationalIdFront: input.nationalIdFront,
                  nationalIdBack: input.nationalIdBack,
                  profession: input.profession,
                  yearsOfExperience: 0,
                  rating: 0,
                  ratingCount: 0,
                  isAvailable: false,
                  totalJobsCompleted: 0,
                  totalEarnings: 0,
                  walletBalance: 0,
                  orderQuota: 0,
                  subscriptionTier: "free",
                  verificationStatus: "PENDING"
                }
              }
            : undefined,
        vendorProfile:
          input.role === "VENDOR"
            ? {
                create: {
                  shopName: input.shopName || (input.firstName + " " + input.lastName),
                  category: input.category || "",
                  governorate: input.governorate || "cairo",
                  city: input.city || "new-cairo",
                  address: input.address || "",
                  latitude: input.latitude || 30.0444,
                  longitude: input.longitude || 31.2357,
                  commercialRegisterUrl: input.commercialRecord,
                  taxCardUrl: input.taxCard,
                  rating: 0,
                  ratingCount: 0,
                  totalOrders: 0,
                  totalEarnings: 0,
                  walletBalance: 0,
                  orderQuota: 0,
                  isOpen: false,
                  verificationStatus: "PENDING"
                }
              }
            : undefined,
        addresses: addressData
      },
      include: {
        clientProfile: true,
        workerProfile: true,
        vendorProfile: true,
        addresses: true
      }
    });


    const tokens = await createSession(user.id, user.role);

    // Send welcome email if email is provided
    if (user.email) {
      sendWelcomeEmail(user.email, user.firstName).catch(err => console.error("Failed to send welcome email:", err));
    }

    return {
      ...tokens,
      user: toPublicUser(user as any)
    };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { phone: input.phone },
      include: {
        clientProfile: true,
        workerProfile: true,
        vendorProfile: true
      }
    });

    if (!user) {
      throw new ApiError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    }

    const matches = await verifyPassword(input.password, user.passwordHash);

    if (!matches) {
      throw new ApiError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const tokens = await createSession(user.id, user.role);

    return {
      ...tokens,
      user: toPublicUser(user)
    };
  },

  async verifyOtp(phone: string, code: string, type: "registration" | "login" | "reset") {
    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        clientProfile: true,
        workerProfile: true,
        vendorProfile: true
      }
    });

    if (!user) {
      throw new ApiError(404, "User not found", "USER_NOT_FOUND");
    }

    const otpType =
      type === "registration"
        ? "EMAIL_VERIFICATION"
        : type === "reset"
          ? "PASSWORD_RESET"
          : "LOGIN";

    const candidateOtps = await prisma.otpCode.findMany({
      where: {
        userId: user.id,
        type: otpType,
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });
    const otp = candidateOtps.find((record) => otpMatches(record.code, user.id, otpType, code));

    if (!otp) {
      throw new ApiError(400, "Invalid or expired OTP code", "INVALID_CODE");
    }

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { isUsed: true }
    });

    if (type === "registration" && user.status !== "ACTIVE") {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: "ACTIVE", emailVerified: true }
      });
      user.status = "ACTIVE";
      user.emailVerified = true;
    }

    const tokens = await createSession(user.id, user.role);

    return {
      ...tokens,
      user: toPublicUser(user)
    };
  },

  async verifyRegistrationOtp(phoneOrEmail: string, code: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: phoneOrEmail },
          { email: phoneOrEmail }
        ]
      },
      include: {
        clientProfile: true,
        workerProfile: true,
        vendorProfile: true
      }
    });

    if (!user) {
      throw new ApiError(404, "المستخدم غير موجود", "USER_NOT_FOUND");
    }

    const candidateOtps = await prisma.otpCode.findMany({
      where: {
        userId: user.id,
        type: "EMAIL_VERIFICATION",
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });
    const otp = candidateOtps.find((record) => otpMatches(record.code, user.id, "EMAIL_VERIFICATION", code));

    if (!otp) {
      throw new ApiError(400, "رمز التحقق غير صحيح أو منتهي الصلاحية", "INVALID_CODE");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          status: "ACTIVE",
          emailVerified: true
        }
      }),
      prisma.otpCode.update({
        where: { id: otp.id },
        data: { isUsed: true }
      })
    ]);

    user.status = "ACTIVE";
    user.emailVerified = true;

    if (user.email) {
      sendWelcomeEmail(user.email, user.firstName).catch(err =>
        console.error("Failed to send welcome email:", err)
      );
    }

    const tokens = await createSession(user.id, user.role);

    return {
      ...tokens,
      user: toPublicUser(user)
    };
  },

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true }
    });

    if (!session || session.id !== payload.sessionId || session.expiresAt < new Date()) {
      throw new ApiError(401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }

    const accessToken = signAccessToken({
      sub: session.userId,
      role: session.user.role,
      sessionId: session.id
    });

    return {
      accessToken,
      refreshToken,
      role: session.user.role
    };
  },

  async switchRoleSession(userId: string, targetRole: UserRole) {
    return createSession(userId, targetRole);
  },

  async logout(sessionId: string) {
    await prisma.session.deleteMany({
      where: { id: sessionId }
    });

    return { cleared: true };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientProfile: true,
        workerProfile: true,
        vendorProfile: true
      }
    });

    if (!user) {
      throw new ApiError(404, "User not found", "USER_NOT_FOUND");
    }

    // Auto-alert technicians who don't have a profile photo
    if (user.role === "WORKER" && !user.avatarUrl) {
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          title: "تنبيه: الصورة الشخصية مطلوبة"
        }
      });

      if (!existingNotification) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: "SYSTEM",
            title: "تنبيه: الصورة الشخصية مطلوبة",
            body: "من فضلك أضف صورتك الشخصية لتفعيل وتوثيق حساب الفني الخاص بك."
          }
        });
      }
    }

    return {
      user: toPublicUser(user)
    };
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't leak user existence, just return success
      return { sent: true };
    }

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code: hashOtpCode(user.id, "PASSWORD_RESET", code),
        type: "PASSWORD_RESET",
        expiresAt
      }
    });

    await sendPasswordResetEmail(user.email!, code).catch(err => console.error("Failed to send reset email:", err));

    return { sent: true };
  },

  async resetPassword(email: string, code: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new ApiError(404, "User not found", "USER_NOT_FOUND");
    }

    const candidateOtps = await prisma.otpCode.findMany({
      where: {
        userId: user.id,
        type: "PASSWORD_RESET",
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });
    const otp = candidateOtps.find((record) => otpMatches(record.code, user.id, "PASSWORD_RESET", code));

    if (!otp) {
      throw new ApiError(400, "Invalid or expired reset code", "INVALID_CODE");
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      }),
      prisma.otpCode.update({
        where: { id: otp.id },
        data: { isUsed: true }
      }),
      // Revoke all existing sessions for security
      prisma.session.deleteMany({
        where: { userId: user.id }
      })
    ]);

    return { reset: true };
  }
};
