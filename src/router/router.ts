import type { HttpMethod } from "../types/types.js";
import type { Handler, Route } from "../types/types.js";

export class Router {
  private routes: Route[] = [];

  register(method: HttpMethod, path: string, handlers: Handler) {
    this.routes.push({ method, path, handlers });
  }

  match(method: HttpMethod, path: string = "/") {
    return this.routes.find(
      (route) => route.method === method && route.path === path,
    );
  }

  get(path: string, handlers: Handler) {
    this.register("GET", path, handlers);
  }

  post(path: string, handlers: Handler) {
    this.register("POST", path, handlers);
  }

  put(path: string, handlers: Handler) {
    this.register("PUT", path, handlers);
  }

  delete(path: string, handlers: Handler) {
    this.register("DELETE", path, handlers);
  }

  patch(path: string, handlers: Handler) {
    this.register("PATCH", path, handlers);
  }
}
