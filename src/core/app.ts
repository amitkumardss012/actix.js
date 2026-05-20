import http from "node:http";
import { Request } from "../http/request.js";
import { Response } from "../http/response.js";
import { Router } from "../router/router.js";
import type { Middleware, Handler, ErrorHandler } from "../types/types.js";

export class Sora {
  private server;
  private router = new Router();

  constructor() {
    this.server = http.createServer(async (req, res) => {
      const request = new Request(req);
      const response = new Response(res);

      // Delegate the entire request to the router's middleware stack.
      // The `done` callback is the final fallback — if no middleware/route
      // has handled the request, respond with 404.
      this.router.handle(request, response, (err?: unknown) => {
        if (response.raw.writableEnded) return;

        if (err) {
          const statusCode = typeof err === "object" && err !== null && "statusCode" in err
            ? (err as { statusCode: number }).statusCode
            : 500;
          const message = err instanceof Error ? err.message : "Internal Server Error";
          response.status(statusCode).json({ error: message });
          return;
        }

        response.status(404).json({ error: "Route not found" });
      });
    });
  }

  // -----------------------------------------------------------------------
  // Middleware registration — app.use()
  // -----------------------------------------------------------------------

  /**
   * Register global or path-scoped middleware.
   *
   *   app.use(logger)                        — global middleware
   *   app.use(logger, cors)                  — multiple global middleware
   *   app.use("/api/user", auth, userRouter) — path-scoped + sub-router
   */
  use(path: string, ...handlers: Array<Middleware | Handler | Router>): void;
  use(...handlers: Array<Middleware | Handler | Router>): void;
  use(
    first: string | Middleware | Handler | Router,
    ...rest: Array<Middleware | Handler | Router>
  ): void {
    if (typeof first === "string") {
      this.router.use(first, ...rest);
    } else {
      this.router.use(first, ...rest);
    }
  }

  // -----------------------------------------------------------------------
  // HTTP route methods — variadic middleware support
  // -----------------------------------------------------------------------

  /**
   *   app.get("/path", handler)
   *   app.get("/path", mw1, mw2, handler)
   */
  get(path: string, ...handlers: Array<Middleware | Handler>) {
    this.router.get(path, ...handlers);
  }

  post(path: string, ...handlers: Array<Middleware | Handler>) {
    this.router.post(path, ...handlers);
  }

  put(path: string, ...handlers: Array<Middleware | Handler>) {
    this.router.put(path, ...handlers);
  }

  delete(path: string, ...handlers: Array<Middleware | Handler>) {
    this.router.delete(path, ...handlers);
  }

  patch(path: string, ...handlers: Array<Middleware | Handler>) {
    this.router.patch(path, ...handlers);
  }

  // -----------------------------------------------------------------------
  // Server lifecycle
  // -----------------------------------------------------------------------

  listen(port: number, callback?: () => void) {
    console.log("thanks for using sora build by amit kumar yadav");
    this.server.listen(port, callback);
  }
}
