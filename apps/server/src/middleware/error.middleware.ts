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
