import type { Request } from "../http/request.js";
import type { Response } from "../http/response.js";
import type { NextFunction } from "../types/types.js";

// ---------------------------------------------------------------------------
// Middleware examples
// ---------------------------------------------------------------------------

/** Simulates a logger — logs method and path, then passes control. */
export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`[LOG] ${req.method} ${req.url}`);
  next();
}

/** Simulates CORS headers — sets header, then passes control. */
export function cors(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
}

/** Simulates auth — always passes for demo purposes. */
export function auth(req: Request, res: Response, next: NextFunction) {
  console.log("[AUTH] Checking authentication...");
  // Simulate: if auth passes, call next(); if it fails, send 401:
  // return res.status(401).json({ error: "Unauthorized" });
  next();
}

/** Simulates an approval check. */
export function isApproved(req: Request, res: Response, next: NextFunction) {
  console.log("[APPROVED] Checking approval status...");
  next();
}

/** Simulates a rate limiter. */
export function rateLimit(req: Request, res: Response, next: NextFunction) {
  console.log("[RATE-LIMIT] Checking rate limit...");
  next();
}

/** Simulates a premium check. */
export function isPremium(req: Request, res: Response, next: NextFunction) {
  console.log("[PREMIUM] Checking premium status...");
  next();
}

// ---------------------------------------------------------------------------
// Route handlers (final handlers — 2-arg is fine, auto-wrapped)
// ---------------------------------------------------------------------------

export function hellow(req: Request, res: Response) {
  return res.json({ message: "Hello World" });
}

export function createPost(req: Request, res: Response) {
  return res.json({ message: "Post created successfully" });
}

export function getProfile(req: Request, res: Response) {
  return res.json({ user: "amit", role: "admin" });
}

export function getUsers(req: Request, res: Response) {
  return res.json({ users: ["amit", "john", "jane"] });
}
