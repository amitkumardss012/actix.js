import type { HttpMethod, Handler, Route, Middleware } from "../types/types.js";
import type { Request } from "../http/request.js";

export class Router {
  private routes: Route[] = [];
  private middlewares: Middleware[] = [];

  private register(method: HttpMethod, path: string, handlers: Handler[]) {
    this.routes.push({ method, path, handlers });
  }

  use(pathOrHandler: string | Handler | Router, ...handlers: (Handler | Router)[]) {
    let path = "/";
    let actualHandlers: (Handler | Router)[] = [];

    if (typeof pathOrHandler === "string") {
      path = pathOrHandler;
      actualHandlers = handlers;
    } else {
      actualHandlers = [pathOrHandler, ...handlers];
    }

    for (const h of actualHandlers) {
      if (h instanceof Router) {
        // Merge routes from sub-router into this router
        for (const route of h.routes) {
          let joinedPath = "";
          if (path === "/") {
            joinedPath = route.path;
          } else {
            joinedPath = path + (route.path === "/" ? "" : route.path);
          }
          this.register(route.method, joinedPath, route.handlers);
        }
        // Merge middlewares from sub-router into this router
        for (const mw of h.middlewares) {
          let joinedPath = "";
          if (path === "/") {
            joinedPath = mw.path;
          } else {
            joinedPath = path + (mw.path === "/" ? "" : mw.path);
          }
          this.middlewares.push({ path: joinedPath, handlers: mw.handlers });
        }
      } else {
        this.middlewares.push({ path, handlers: [h] });
      }
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

