import { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';


interface RateLimitOptions {
  limitDuration?: number; // in seconds
  requestsPerDuration?: number;
  errorMessage?: string;
}

const rateLimitMiddleware = ({
  limitDuration = 60, // 60 seconds
  requestsPerDuration = 10,
  errorMessage = 'Looks like you are moving too fast. Retry again in few minutes.',
}: RateLimitOptions = {}): RequestHandler => {
  return rateLimit({
    windowMs: limitDuration * 1000, // convert to milliseconds
    max: requestsPerDuration,
    message: {
      error: errorMessage,
    },
    keyGenerator: (req) => {
      const appReq = req as { user?: { id?: number } };
      return appReq.user?.id?.toString() || req.ip || 'anonymous';
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Store can be added here for Redis if needed
  });
};

export default rateLimitMiddleware;