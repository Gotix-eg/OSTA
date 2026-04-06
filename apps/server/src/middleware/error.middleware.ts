import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/ApiError.js";
import { errorResponse } from "../utils/ApiResponse.js";

export function notFoundHandler(_request: Request, _response: Response, next: NextFunction) {
  next(new ApiError(404, "Route not found"));
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  console.error("[ErrorHandler]", error);

  if (error instanceof ApiError || (error && typeof error === "object" && "statusCode" in error)) {
    const apiError = error as ApiError;
    response.status(apiError.statusCode || 400).json(errorResponse(apiError.message, apiError.code));
    return;
  }

  response.status(500).json(errorResponse("Something went wrong", "INTERNAL_SERVER_ERROR"));
}
