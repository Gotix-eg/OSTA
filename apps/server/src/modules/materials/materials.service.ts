import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { 
  CreateMaterialRequestInput, 
  CreateMaterialOfferInput, 
  AcceptOfferInput 
} from "./materials.validation.js";

export const materialsService = {
  // ============================
  // Client/Worker (Requester) Methods
  // ============================
  
  async createRequest(userId: string, userRole: any, input: CreateMaterialRequestInput) {
    return prisma.materialRequest.create({
      data: {
        requesterId: userId,
        requesterRole: userRole,
        title: input.title,
        description: input.description,
        images: input.images || [],
        voiceNote: input.voiceNote,
        latitude: input.latitude,
        longitude: input.longitude,
        deliveryMethod: input.deliveryMethod,
        status: "PENDING",
      },
    });
  },

  async getMyRequests(userId: string) {
    return prisma.materialRequest.findMany({
      where: { requesterId: userId },
      include: {
        offers: {
            include: { vendor: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } } }
        },
        order: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getRequestDetails(id: string, userId: string) {
    const request = await prisma.materialRequest.findUnique({
      where: { id },
      include: {
        offers: {
            include: { vendor: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } } }
        },
        order: {
            include: { vendor: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } } }
        },
      },
    });

    if (!request) throw new ApiError(404, "الطلب غير موجود");
    if (request.requesterId !== userId) throw new ApiError(403, "غير مصرح لك");

    return request;
  },

  async acceptOffer(requestId: string, offerId: string, userId: string, input: AcceptOfferInput) {
    const request = await prisma.materialRequest.findUnique({
      where: { id: requestId },
      include: { offers: true }
    });

    if (!request) throw new ApiError(404, "الطلب غير موجود");
    if (request.requesterId !== userId) throw new ApiError(403, "غير مصرح لك");
    if (request.status !== "PENDING" && request.status !== "OFFERS_RECEIVED") {
      throw new ApiError(400, "لا يمكن قبول عروض لهذا الطلب");
    }

    const offer = request.offers.find((o) => o.id === offerId);
    if (!offer) throw new ApiError(404, "العرض غير موجود");

    // Start a transaction to approve offer and generate order
    return prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.materialOrder.create({
        data: {
          requestId: request.id,
          offerId: offer.id,
          vendorId: offer.vendorId,
          clientId: request.requesterId,
          status: "ACCEPTED",
          deliveryMethod: input.deliveryMethod,
          paymentMethod: input.paymentMethod,
          totalAmount: offer.totalPrice,
        }
      });

      // Update offer status
      await tx.materialOffer.update({
        where: { id: offer.id },
        data: { isAccepted: true },
      });

      // Update request status
      await tx.materialRequest.update({
        where: { id: request.id },
        data: { status: "ACCEPTED" },
      });

      return order;
    });
  },


  // ============================
  // Vendor Methods
  // ============================

  async getNearbyRequests(vendorId: string) {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: vendorId } });
    if (!vendor || !vendor.latitude || !vendor.longitude) {
      throw new ApiError(400, "برجاء تحديث موقع المحل لتلقي الطلبات");
    }

    // In a real app we would use PostGIS or Haversine formula for radius distance filtering.
    // For now we'll do a basic filter based on status.
    return prisma.materialRequest.findMany({
      where: {
        status: { in: ["PENDING", "OFFERS_RECEIVED"] },
        // filter out requests the vendor has already made an offer on:
        offers: { none: { vendorId: vendor.id } }
      },
      include: {
        requester: { select: { firstName: true, lastName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  },

  async createOffer(requestId: string, vendorId: string, input: CreateMaterialOfferInput) {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: vendorId } });
    if (!vendor) throw new ApiError(404, "محل الفيندور غير موجود");

    const request = await prisma.materialRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) throw new ApiError(404, "الطلب غير موجود");
    if (request.status !== "PENDING" && request.status !== "OFFERS_RECEIVED") {
      throw new ApiError(400, "لا يمكن إضافة عروض لهذا الطلب الآن");
    }

    // Check if offer already exists
    const existingOffer = await prisma.materialOffer.findUnique({
      where: { requestId_vendorId: { requestId, vendorId: vendor.id } }
    });

    if (existingOffer) throw new ApiError(400, "لقد قمت بإضافة عرض مسبقاً لهذا الطلب");

    const totalPrice = input.price + input.deliveryFee;

    const offer = await prisma.materialOffer.create({
      data: {
        requestId,
        vendorId: vendor.id,
        price: input.price,
        deliveryFee: input.deliveryFee,
        totalPrice,
        estimatedDeliveryTime: input.estimatedDeliveryTime,
        notes: input.notes,
      }
    });

    // Update request status to OFFERS_RECEIVED if it was PENDING
    if (request.status === "PENDING") {
      await prisma.materialRequest.update({
        where: { id: requestId },
        data: { status: "OFFERS_RECEIVED" }
      });
    }

    return offer;
  },

  async getVendorOrders(vendorId: string) {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: vendorId } });
    if (!vendor) throw new ApiError(404, "الفيندور غير موجود");

    return prisma.materialOrder.findMany({
      where: { vendorId: vendor.id },
      include: {
        request: true,
        offer: true,
      },
      orderBy: { createdAt: "desc" }
    });
  },

  async updateOrderStatus(orderId: string, vendorId: string, status: any) {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: vendorId } });
    if (!vendor) throw new ApiError(404, "الفيندور غير موجود");

    const order = await prisma.materialOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new ApiError(404, "الطلب غير موجود");
    if (order.vendorId !== vendor.id) throw new ApiError(403, "غير مصرح لك");

    return prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.materialOrder.update({
        where: { id: orderId },
        data: { status }
      });

      await tx.materialRequest.update({
        where: { id: order.requestId },
        data: { status }
      });

      return updatedOrder;
    });
  }
};
