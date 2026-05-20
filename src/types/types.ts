import type { Request } from "../http/request.js";
import type { Response } from "../http/response.js";

export type NextFunction = (err?: any) => void | Promise<void>;

export type Handler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

export type ErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

export interface Route {
  method: HttpMethod;
  path: string;
  handlers: Handler[];
}

export interface Middleware {
  path: string;
  handlers: Handler[];
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  path?: string;
  domain?: string;
  maxAge?: number;
  sameSite?: "strict" | "lax" | "none";
};
