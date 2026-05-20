import type { Request } from "../http/request.js";
import type { Response } from "../http/response.js";

// ---------------------------------------------------------------------------
// HTTP method union
// ---------------------------------------------------------------------------
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// ---------------------------------------------------------------------------
// Core function signatures
// ---------------------------------------------------------------------------

/** Advances to the next middleware. Pass an error to skip to error handlers. */
export type NextFunction = (err?: unknown) => void;

/**
 * Standard middleware signature — the primary building block of the pipeline.
 * Every middleware and route handler is normalised to this shape internally.
 */
export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

/**
 * Convenience alias for a terminal route handler that doesn't need `next`.
 * Accepted by route methods (`get`, `post`, …) and auto-wrapped to Middleware.
 */
export type Handler = (
  req: Request,
  res: Response,
) => void | Promise<void>;

/**
 * Error-handling middleware — Express 4-arg convention.
 * Invoked when `next(err)` is called upstream.
 */
export type ErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

// ---------------------------------------------------------------------------
// Internal layer representation
// ---------------------------------------------------------------------------

/**
 * A single entry in the Router's middleware stack.
 *
 * - `path`    — `"/"` for global middleware, `"/prefix"` for path-scoped.
 * - `method`  — `"*"` for `use()` layers, specific method for route layers.
 * - `handlers`— ordered chain of Middleware functions for this layer.
 */
export interface Layer {
  path: string;
  method: HttpMethod | "*";
  handlers: Middleware[];
}

// ---------------------------------------------------------------------------
// Cookie options (unchanged)
// ---------------------------------------------------------------------------
export type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  path?: string;
  domain?: string;
  maxAge?: number;
  sameSite?: "strict" | "lax" | "none";
};
