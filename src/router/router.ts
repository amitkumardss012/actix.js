import type { HttpMethod, Handler, Route, Middleware } from "../types/types.js";

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

  getHandlers(method: HttpMethod, path: string = "/"): Handler[] {
    const matchedHandlers: Handler[] = [];

    // Match global/path-specific middlewares
    for (const mw of this.middlewares) {
      if (path.startsWith(mw.path) || mw.path === "/") {
        matchedHandlers.push(...mw.handlers);
      }
    }

    // Match route specific handlers
    const route = this.routes.find(
      (r) => r.method === method && r.path === path,
    );

    if (route) {
      matchedHandlers.push(...route.handlers);
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
