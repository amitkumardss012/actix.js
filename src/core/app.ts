import http from "node:http";
import { Request } from "../http/request.js";
import { Response } from "../http/response.js";
import { Router } from "../router/router.js";
import type { Handler } from "../types/types.js";

export class Sora {
  private server;
  private router = new Router();

  constructor() {
    this.server = http.createServer(async (req, res) => {
      const request = new Request(req);
      const response = new Response(res);

      const route = this.router.match(request.method, request.path);

      if (!route) {
        response.status(404).json({ error: "Route not found" });
        return;
      }

      await route.handlers(request, response);
    });
  }
  
  get(path: string, handlers: Handler) {
    this.router.get(path, handlers);
  }

  post(path: string, handlers: Handler) {
    this.router.post(path, handlers);
  }

  put(path: string, handlers: Handler) {
    this.router.put(path, handlers);
  }

  delete(path: string, handlers: Handler) {
    this.router.delete(path, handlers);
  }
 
  patch(path: string, handlers: Handler) {
    this.router.patch(path, handlers);
  }

  listen(port: number, callback?: () => void) {
    console.log("thanks for using sora build by amit kumar yadav")
    this.server.listen(port, callback);
  }
}
