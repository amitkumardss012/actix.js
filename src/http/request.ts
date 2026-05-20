import type { IncomingMessage } from "node:http";
import type { HttpMethod } from "../types/types.js";

export class Request {
  public method: HttpMethod;
  public url: string;

  /**
   * Accumulated path prefix stripped by parent routers.
   * Used internally to implement sub-router path resolution.
   * Equivalent to Express's `req.baseUrl`.
   */
  public basePath: string = "";

  constructor(public raw: IncomingMessage) {
    this.method = (raw.method as HttpMethod) || "GET";
    this.url = raw.url || "/";
  }

  /** The request path relative to the current router's mount point. */
  get path(): string {
    const fullPath = this.url.split("?")[0] || "/";

    if (this.basePath && fullPath.startsWith(this.basePath)) {
      const relative = fullPath.slice(this.basePath.length);
      return relative === "" ? "/" : relative;
    }

    return fullPath;
  }

  /** The raw query string (without leading `?`), or `undefined`. */
  get query(): string | undefined {
    return this.url.split("?")[1];
  }
}
