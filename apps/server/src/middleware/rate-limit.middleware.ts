import rateLimit from "express-rate-limit";

function buildMessage(message: string) {
  return {
    success: false,
    message,
    error: {
      code: "RATE_LIMITED"
    }
  };
}

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildMessage("Too many authentication requests. Please try again later.")
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildMessage("Too many login attempts. Please try again later.")
});

export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildMessage("Too many OTP attempts. Please request a new code later.")
});

export const passwordResetLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildMessage("Too many password reset requests. Please try again later.")
});

export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildMessage("Too many registration attempts. Please try again later.")
});
