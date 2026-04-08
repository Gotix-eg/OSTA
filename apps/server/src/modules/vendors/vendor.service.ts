import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { RegisterVendorInput, UpdateVendorProfileInput } from "./vendor.validation.js";
import { hashPassword } from "../../utils/password.js";
import { signAccessToken, signRefreshToken } from "../../utils/tokens.js";

export const vendorService = {
  async register(input: RegisterVendorInput) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: input.phone },
          ...(input.email ? [{ email: input.email }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ApiError(409, "هذا الحساب مسجل بالفعل", "USER_EXISTS");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        email: input.email,
        passwordHash,
        role: "VENDOR",
        vendorProfile: {
          create: {
            shopName: input.shopName,
            shopNameAr: input.shopNameAr,
            governorate: input.governorate,
            city: input.city,
            area: input.area,
            address: input.address,
            latitude: input.latitude,
            longitude: input.longitude,
          },
        },
      },
      include: {
        vendorProfile: true,
      },
    });

    // Create session
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: crypto.randomUUID(),
        expiresAt,
      },
    });

    const refreshToken = signRefreshToken({
      sub: user.id,
      sessionId: session.id,
      type: "refresh",
    });

    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken },
    });

    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role,
      sessionId: session.id,
    });

    return {
      sessionId: session.id,
      accessToken,
      refreshToken,
      expiresAt,
      user: {
        id: user.id,
        role: user.role,
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        vendorProfile: user.vendorProfile,
      },
    };
  },

  async getProfile(userId: string) {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new ApiError(404, "لم يتم العثور على بيانات المحل", "VENDOR_NOT_FOUND");
    }

    return vendor;
  },

  async updateProfile(userId: string, input: UpdateVendorProfileInput) {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new ApiError(404, "لم يتم العثور على بيانات المحل", "VENDOR_NOT_FOUND");
    }

    return prisma.vendorProfile.update({
      where: { userId },
      data: input,
    });
  },

  async updateLocation(userId: string, latitude: number, longitude: number) {
    return prisma.vendorProfile.update({
      where: { userId },
      data: { latitude, longitude },
    });
  },

  async updateStatus(userId: string, isOpen: boolean) {
    return prisma.vendorProfile.update({
      where: { userId },
      data: { isOpen },
    });
  },
};
