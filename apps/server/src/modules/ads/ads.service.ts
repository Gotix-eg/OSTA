import { prisma } from "../../lib/prisma.js";
import { AdPlacement, AdType, AdStatus } from "@prisma/client";

export const adsService = {
  async getServedAds(placement: AdPlacement) {
    // Only return ACTIVE ads for this placement
    return prisma.adCampaign.findMany({
      where: {
        placement,
        status: "ACTIVE"
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  },

  async recordImpression(id: string) {
    return prisma.adCampaign.update({
      where: { id },
      data: { views: { increment: 1 } }
    });
  },

  async recordClick(id: string) {
    return prisma.adCampaign.update({
      where: { id },
      data: { clicks: { increment: 1 } }
    });
  },

  async getAllCampaigns() {
    return prisma.adCampaign.findMany({
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { id: true, firstName: true, phone: true } } }
    });
  },

  async createCampaign(data: {
    type: AdType;
    placement: AdPlacement;
    title: string;
    imageUrl?: string;
    targetUrl?: string;
    ownerId?: string;
  }) {
    return prisma.adCampaign.create({
      data: {
        ...data,
        status: "PENDING"
      }
    });
  },

  async updateCampaignStatus(id: string, status: AdStatus) {
    return prisma.adCampaign.update({
      where: { id },
      data: { status }
    });
  },

  async deleteCampaign(id: string) {
    return prisma.adCampaign.delete({
      where: { id }
    });
  }
};
