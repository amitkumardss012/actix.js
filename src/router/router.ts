import type {
  HttpMethod,
  Middleware,
  Handler,
  ErrorHandler,
  Layer,
  NextFunction,
} from "../types/types.js";
import type { Request } from "../http/request.js";
import type { Response } from "../http/response.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wraps a 2-arg handler `(req, res)` into a 3-arg middleware `(req, res, next)`.
 * If the handler returns a promise, errors are forwarded via `next(err)`.
 */
function wrapHandler(fn: Handler | Middleware): Middleware {
  // Already a 3-arg middleware — return as-is
  if (fn.length >= 3) return fn as Middleware;

  // Wrap the 2-arg handler so `next()` is called automatically after it resolves
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = (fn as Handler)(req, res);

    if (result instanceof Promise) {
      result.catch(next);
    }
  };
}

/**
 * Returns `true` if `fn` has the 4-arg error-handler signature.
 */
function isErrorHandler(fn: unknown): fn is ErrorHandler {
  return typeof fn === "function" && fn.length === 4;
}

/**
 * Normalises a path for consistent matching.
 * - Ensures a leading `/`
 * - Strips trailing `/` (except for root `"/"`)
 */
function normalisePath(path: string): string {
  if (!path || path === "/") return "/";
  if (!path.startsWith("/")) path = "/" + path;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export class Router {
  /** Ordered middleware / route stack. */
  private stack: Layer[] = [];

  // -----------------------------------------------------------------------
  // Registration — use()
  // -----------------------------------------------------------------------

  /**
   * Register middleware or mount a sub-router.
   *
   * Overloads mirror Express:
   *   use(middleware)
   *   use(mw1, mw2, …)
   *   use("/path", mw1, mw2, …)
   *   use("/path", subRouter)
   */
  use(path: string, ...handlers: Array<Middleware | Handler | Router>): void;
  use(...handlers: Array<Middleware | Handler | Router>): void;
  use(
    first: string | Middleware | Handler | Router,
    ...rest: Array<Middleware | Handler | Router>
  ): void {
    let path: string;
    let rawHandlers: Array<Middleware | Handler | Router>;

    if (typeof first === "string") {
      path = normalisePath(first);
      rawHandlers = rest;
    } else {
      path = "/";
      rawHandlers = [first, ...rest];
    }

    // Normalise each handler — Routers are kept as-is and handled during dispatch
    const middlewares = rawHandlers.map((h) =>
      h instanceof Router ? this.routerToMiddleware(h) : wrapHandler(h),
    );

    this.stack.push({ path, method: "*", handlers: middlewares });
  }

  // -----------------------------------------------------------------------
  // Registration — HTTP methods
  // -----------------------------------------------------------------------

  /**
   * Register a GET route with optional inline middleware.
   *   get("/path", handler)
   *   get("/path", mw1, mw2, handler)
   */
  get(path: string, ...handlers: Array<Middleware | Handler>): void {
    this.register("GET", path, handlers);
  }

  post(path: string, ...handlers: Array<Middleware | Handler>): void {
    this.register("POST", path, handlers);
  }

  put(path: string, ...handlers: Array<Middleware | Handler>): void {
    this.register("PUT", path, handlers);
  }

  delete(path: string, ...handlers: Array<Middleware | Handler>): void {
    this.register("DELETE", path, handlers);
  }

  patch(path: string, ...handlers: Array<Middleware | Handler>): void {
    this.register("PATCH", path, handlers);
  }

  private register(
    method: HttpMethod,
    path: string,
    handlers: Array<Middleware | Handler>,
  ): void {
    const middlewares = handlers.map((h) => wrapHandler(h));
    this.stack.push({ path: normalisePath(path), method, handlers: middlewares });
  }

  // -----------------------------------------------------------------------
  // Dispatch — handle()
  // -----------------------------------------------------------------------

  /**
   * Walk the stack and execute matching layers in order.
   *
   * @param req   — The incoming request.
   * @param res   — The outgoing response.
   * @param done  — Called when the entire stack is exhausted (or on unhandled error).
   */
  handle(req: Request, res: Response, done: NextFunction): void {
    const stack = this.stack;
    let layerIndex = 0;

    const next = (err?: unknown): void => {
      // Exhausted all layers — delegate to parent
      if (layerIndex >= stack.length) {
        done(err);
        return;
      }

      const layer = stack[layerIndex++]!;

      // ------ Path matching ------
      const reqPath = req.path;

      if (layer.method === "*") {
        // Middleware layer (app.use) — prefix match
        if (!this.pathMatchesPrefix(reqPath, layer.path)) {
          next(err);
          return;
        }
      } else {
        // Route layer (app.get, etc.) — exact method + path match
        if (layer.method !== req.method || reqPath !== layer.path) {
          next(err);
          return;
        }
      }

      // ------ Error short-circuit ------
      // If there's an error, skip non-error-handling layers
      if (err) {
        // Check if any handler in this layer is an error handler
        const errorHandler = layer.handlers.find((h) => isErrorHandler(h));
        if (errorHandler) {
          (errorHandler as unknown as ErrorHandler)(err, req, res, next);
        } else {
          // Skip this layer, propagate the error
          next(err);
        }
        return;
      }

      // ------ Strip path prefix for sub-router execution ------
      const originalBasePath = req.basePath;
      if (layer.path !== "/" && layer.method === "*") {
        req.basePath = originalBasePath + layer.path;
      }

      // ------ Execute the handler chain within this layer ------
      this.runHandlerChain(layer.handlers, 0, req, res, (chainErr?: unknown) => {
        // Restore the original basePath after this layer completes
        req.basePath = originalBasePath;
        next(chainErr);
      });
    };

    next();
  }

  // -----------------------------------------------------------------------
  // Internal — handler chain execution
  // -----------------------------------------------------------------------

  /**
   * Sequentially execute the handlers within a single layer.
   * Each handler calls its local `next` to advance to the next handler in the chain,
   * or to break out of the layer entirely.
   */
  private runHandlerChain(
    handlers: Middleware[],
    index: number,
    req: Request,
    res: Response,
    layerNext: NextFunction,
  ): void {
    // All handlers in this layer are done — advance to the next layer
    if (index >= handlers.length) {
      layerNext();
      return;
    }

    const handler = handlers[index]!;

    try {
      handler(req, res, (err?: unknown) => {
        if (err) {
          // An error occurred — break out of this layer's chain
          layerNext(err);
          return;
        }
        // Advance to the next handler in this layer
        this.runHandlerChain(handlers, index + 1, req, res, layerNext);
      });
    } catch (err) {
      layerNext(err);
    }
  }

  // -----------------------------------------------------------------------
  // Internal — path matching
  // -----------------------------------------------------------------------

  /**
   * Returns `true` if `requestPath` starts with `layerPath`.
   * Root path `"/"` matches everything.
   */
  private pathMatchesPrefix(requestPath: string, layerPath: string): boolean {
    if (layerPath === "/") return true;

    // Must match the prefix exactly and be followed by `/` or end of string
    // e.g., layerPath="/api" should match "/api", "/api/users" but NOT "/api2"
    if (requestPath === layerPath) return true;
    if (requestPath.startsWith(layerPath + "/")) return true;

    return false;
  }

  // -----------------------------------------------------------------------
  // Internal — sub-router wrapping
  // -----------------------------------------------------------------------

  /**
   * Wraps a Router instance into a Middleware function.
   * When invoked, delegates to the sub-router's `handle()`.
   */
  private routerToMiddleware(router: Router): Middleware {
    return (req: Request, res: Response, next: NextFunction): void => {
      router.handle(req, res, next);
    };
  }
}
