import http from "node:http";
import { Request } from "../http/request.js";
import { Response } from "../http/response.js";
import { Router } from "../router/router.js";
import type { Handler } from "../types/types.js";

export class Actix {
  private server;
  private router = new Router();

  constructor() {
    this.server = http.createServer(async (req, res) => {
      const request = new Request(req);
      const response = new Response(res);

      // Parse body asynchronously
      await new Promise<void>((resolve) => {
        let bodyData = "";
        req.on("data", (chunk) => {
          bodyData += chunk;
        });
        req.on("end", () => {
          if (bodyData) {
            const contentType = req.headers["content-type"] || "";
            if (contentType.includes("application/json")) {
              try {
                request.body = JSON.parse(bodyData);
              } catch (e) {
                request.body = bodyData;
              }
            } else if (contentType.includes("application/x-www-form-urlencoded")) {
              try {
                request.body = Object.fromEntries(new URLSearchParams(bodyData));
              } catch (e) {
                request.body = bodyData;
              }
            } else {
              request.body = bodyData;
            }
          } else {
            request.body = {};
          }
          resolve();
        });
        req.on("error", () => {
          request.body = {};
          resolve();
        });
      });

      const handlers = this.router.getHandlers(request.method, request.path, request);

      if (handlers.length === 0) {
        response.status(404).json({ error: "Route not found" });
        return;
      }

      let index = 0;
      const next = async (err?: any) => {
        if (err) {
          response.status(500).json({ error: err.message || "Internal Server Error" });
          return;
        }

        if (index < handlers.length) {
          const handler = handlers[index++];
          if (handler) {
            try {
              await handler(request, response, next);
            } catch (e) {
              next(e);
            }
          } else {
            await next();
          }
        }
      };

      await next();
      if (!res.writableEnded) {
        response.status(404).json({ error: "Route not found" });
      }
    });
  }

  use(pathOrHandler: string | Handler | Router, ...handlers: (Handler | Router)[]) {
    this.router.use(pathOrHandler, ...handlers);
  }

  get(path: string, ...handlers: Handler[]) {
    this.router.get(path, ...handlers);
  }

  post(path: string, ...handlers: Handler[]) {
    this.router.post(path, ...handlers);
  }

  put(path: string, ...handlers: Handler[]) {
    this.router.put(path, ...handlers);
  }

  delete(path: string, ...handlers: Handler[]) {
    this.router.delete(path, ...handlers);
  }

  patch(path: string, ...handlers: Handler[]) {
    this.router.patch(path, ...handlers);
  }

  listen(port: number, callback?: () => void) {
    console.log("thanks for using sora build by amit kumar yadav")
    this.server.listen(port, callback);
  }
}
