import type { UserRole } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/tokens.js";

type RegisterInput = {
  role: "CLIENT" | "WORKER";
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
};

type LoginInput = {
  phone: string;
  password: string;
};

function toPublicUser(user: {
  id: string;
  role: UserRole;
  phone: string;
  email: string | null;
  firstName: string;
  lastName: string;
  preferredLanguage: string;
  status: string;
  clientProfile?: { totalRequests: number; walletBalance: number; isVip: boolean } | null;
  workerProfile?: { yearsOfExperience: number; rating: number; isAvailable: boolean } | null;
}) {
  return {
    id: user.id,
    role: user.role,
    phone: user.phone,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    preferredLanguage: user.preferredLanguage,
    status: user.status,
    profile:
      user.role === "CLIENT"
        ? user.clientProfile
        : user.role === "WORKER"
          ? user.workerProfile
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
        OR: [
          { phone: input.phone },
          ...(input.email ? [{ email: input.email }] : [])
        ]
      }
    });

    if (existingUser) {
      throw new ApiError(409, "User already exists", "USER_EXISTS");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        email: input.email,
        passwordHash,
        role: input.role,
        clientProfile:
          input.role === "CLIENT"
            ? {
                create: {}
              }
            : undefined,
        workerProfile:
          input.role === "WORKER"
            ? {
                create: {}
              }
            : undefined
      },
      include: {
        clientProfile: true,
        workerProfile: true
      }
    });

    const tokens = await createSession(user.id, user.role);

    return {
      ...tokens,
      user: toPublicUser(user)
    };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { phone: input.phone },
      include: {
        clientProfile: true,
        workerProfile: true
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

  async verifyOtp(phone: string) {
    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        clientProfile: true,
        workerProfile: true
      }
    });

    if (!user) {
      throw new ApiError(404, "User not found", "USER_NOT_FOUND");
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
        workerProfile: true
      }
    });

    if (!user) {
      throw new ApiError(404, "User not found", "USER_NOT_FOUND");
    }

    return {
      user: toPublicUser(user)
    };
  }
};
