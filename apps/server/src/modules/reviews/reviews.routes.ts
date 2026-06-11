import { Router, Request, Response } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { z } from "zod";

const router = Router();
router.use(authenticate);

const createReviewSchema = z.object({
  targetId: z.string(),
  requestId: z.string(),
  overallRating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// POST /api/reviews - Add a review
router.post("/", catchAsync(async (request: Request, response: Response) => {
  const authorId = request.auth!.userId;
  const data = createReviewSchema.parse(request.body);

  // Check if they already reviewed for this request
  if (data.requestId) {
    const existing = await prisma.review.findFirst({
      where: { authorId, targetId: data.targetId, requestId: data.requestId }
    });
    if (existing) {
      throw new ApiError(400, "You have already reviewed this user for this request.");
    }
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      authorId,
      targetId: data.targetId,
      requestId: data.requestId,
      overallRating: data.overallRating,
      comment: data.comment,
    }
  });

  // Calculate new average rating for the user
  const aggregations = await prisma.review.aggregate({
    where: { targetId: data.targetId },
    _avg: { overallRating: true },
    _count: { overallRating: true },
  });

  const newAverage = aggregations._avg?.overallRating || 5;

  const targetUser = await prisma.user.findUnique({ where: { id: data.targetId } });
  if (targetUser) {
    if (targetUser.role === "WORKER") {
      await prisma.workerProfile.update({ where: { userId: targetUser.id }, data: { rating: newAverage } });
    } else if (targetUser.role === "VENDOR") {
      await prisma.vendorProfile.update({ where: { userId: targetUser.id }, data: { rating: newAverage } });
    } else {
      await prisma.clientProfile.update({ where: { userId: targetUser.id }, data: { rating: newAverage } });
    }
  }

  response.status(201).json(successResponse(review, "Review submitted successfully"));
}));

// POST /api/reviews/direct - Direct rating
const createDirectReviewSchema = z.object({
  targetId: z.string(),
  overallRating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

router.post("/direct", catchAsync(async (request: Request, response: Response) => {
  const authorId = request.auth!.userId;
  const data = createDirectReviewSchema.parse(request.body);

  // Get author client profile
  const authorProfile = await prisma.clientProfile.findUnique({
    where: { userId: authorId }
  });
  if (!authorProfile) throw new ApiError(404, "Client profile not found");

  // Get target worker profile
  const targetWorkerProfile = await prisma.workerProfile.findUnique({
    where: { userId: data.targetId }
  });
  if (!targetWorkerProfile) throw new ApiError(404, "Worker profile not found");

  // Check if a review already exists for this direct connection
  const existing = await prisma.review.findFirst({
    where: {
      authorId,
      targetId: data.targetId,
      request: {
        title: "Direct Review Request"
      }
    }
  });
  if (existing) {
    throw new ApiError(400, "You have already reviewed this technician.");
  }

  // Get fallback service
  const fallbackService = await prisma.service.findFirst();
  if (!fallbackService) throw new ApiError(500, "No services available in the system");

  // Get client address
  let fallbackAddress = await prisma.address.findFirst({
    where: { userId: authorId }
  });
  if (!fallbackAddress) {
    fallbackAddress = await prisma.address.create({
      data: {
        userId: authorId,
        governorate: "Cairo",
        city: "Cairo",
        area: "Cairo",
        street: "Default Street",
        label: "Default Address"
      }
    });
  }

  // Generate unique request number
  let requestNumber = "";
  while (true) {
    const candidate = String(Math.floor(10000000 + Math.random() * 90000000));
    const existingReq = await prisma.serviceRequest.findUnique({
      where: { requestNumber: candidate },
    });
    if (!existingReq) {
      requestNumber = candidate;
      break;
    }
  }

  // Create dummy request
  const dummyRequest = await prisma.serviceRequest.create({
    data: {
      clientId: authorProfile.id,
      workerId: targetWorkerProfile.id,
      serviceId: fallbackService.id,
      addressId: fallbackAddress.id,
      requestNumber,
      title: "Direct Review Request",
      description: "Direct rating submitted from worker profile page.",
      status: "COMPLETED",
      urgency: "NORMAL"
    }
  });

  // Create review
  const review = await prisma.review.create({
    data: {
      authorId,
      targetId: data.targetId,
      requestId: dummyRequest.id,
      overallRating: data.overallRating,
      comment: data.comment,
    }
  });

  // Calculate new average rating for the worker
  const aggregations = await prisma.review.aggregate({
    where: { targetId: data.targetId },
    _avg: { overallRating: true },
    _count: { overallRating: true },
  });

  const newAverage = aggregations._avg?.overallRating || 5;
  const newCount = aggregations._count?.overallRating || 0;

  await prisma.workerProfile.update({
    where: { id: targetWorkerProfile.id },
    data: {
      rating: newAverage,
      ratingCount: newCount
    }
  });

  response.status(201).json(successResponse(review, "Review submitted successfully"));
}));

// GET /api/reviews/:userId - Get reviews for a specific user
router.get("/:userId", catchAsync(async (request: Request, response: Response) => {
  const userId = request.params.userId as string;
  const reviews = await prisma.review.findMany({
    where: { targetId: userId },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  response.json(successResponse(reviews, "Reviews retrieved successfully"));
}));

export const reviewsRouter = router;
