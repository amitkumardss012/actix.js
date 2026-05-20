import type { HttpMethod, Handler, Route, Middleware } from "../types/types.js";
import type { Request } from "../http/request.js";

export class Router {
  private routes: Route[] = [];
  private middlewares: Middleware[] = [];

  private register(method: HttpMethod, path: string, handlers: Handler[]) {
    this.routes.push({ method, path, handlers });
  }

  use(pathOrHandler: string | Handler, ...handlers: Handler[]) {
    if (typeof pathOrHandler === "string") {
      this.middlewares.push({ path: pathOrHandler, handlers });
    } else {
      this.middlewares.push({ path: "/", handlers: [pathOrHandler, ...handlers] });
    }
  }

  getHandlers(method: HttpMethod, path: string = "/", request?: Request): Handler[] {
    const matchedHandlers: Handler[] = [];

    // Match global/path-specific middlewares
    for (const mw of this.middlewares) {
      if (path.startsWith(mw.path) || mw.path === "/") {
        matchedHandlers.push(...mw.handlers);
      }
    }

    // Match route specific handlers
    let matchedRoute: Route | undefined;
    let params: Record<string, string> = {};

    for (const r of this.routes) {
      if (r.method !== method) continue;

      const routeSegments = r.path.split("/");
      const pathSegments = path.split("/");

      if (routeSegments.length !== pathSegments.length) continue;

      let matched = true;
      const routeParams: Record<string, string> = {};

      for (let i = 0; i < routeSegments.length; i++) {
        const routeSeg = routeSegments[i] || "";
        const pathSeg = pathSegments[i] || "";

        if (routeSeg.startsWith("{") && routeSeg.endsWith("}")) {
          const paramName = routeSeg.slice(1, -1);
          routeParams[paramName] = decodeURIComponent(pathSeg);
        } else if (routeSeg !== pathSeg) {
          matched = false;
          break;
        }
      }

      if (matched) {
        matchedRoute = r;
        params = routeParams;
        break;
      }
    }

    if (matchedRoute) {
      if (request) {
        request.params = params;
      }
      matchedHandlers.push(...matchedRoute.handlers);
    }

    return matchedHandlers;
  }

  get(path: string, ...handlers: Handler[]) {
    this.register("GET", path, handlers);
  }

  post(path: string, ...handlers: Handler[]) {
    this.register("POST", path, handlers);
  }

  put(path: string, ...handlers: Handler[]) {
    this.register("PUT", path, handlers);
  }

  delete(path: string, ...handlers: Handler[]) {
    this.register("DELETE", path, handlers);
  }

  patch(path: string, ...handlers: Handler[]) {
    this.register("PATCH", path, handlers);
  }
}

