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
