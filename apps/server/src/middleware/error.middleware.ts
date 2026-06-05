import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/ApiError.js";
import { errorResponse } from "../utils/ApiResponse.js";

export function notFoundHandler(_request: Request, _response: Response, next: NextFunction) {
  next(new ApiError(404, "Route not found"));
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof ApiError) {
    response.status(error.statusCode).json(errorResponse(error.message, error.code));
    return;
  }

  // Handle Prisma Unique Constraint Error
  if (typeof error === "object" && error !== null && "code" in error && (error as any).code === "P2002") {
    const target = Array.isArray((error as any).meta?.target) ? (error as any).meta.target.join(", ") : "الحقل";
    response.status(409).json({
      success: false,
      message: `هذه البيانات مسجلة بالفعل: ${target}`,
      error: "UNIQUE_CONSTRAINT_FAILED",
    });
    return;
  }

  console.error("Unhandled error:", error);
  const message = error instanceof Error ? error.message : "Something went wrong";
  const stack = error instanceof Error ? error.stack : undefined;
  
  response.status(500).json({
    success: false,
    message: message,
    error: "INTERNAL_SERVER_ERROR",
    stack: process.env.NODE_ENV === "development" ? stack : undefined
  });
}
