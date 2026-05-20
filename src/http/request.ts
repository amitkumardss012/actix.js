import type { IncomingMessage } from "node:http";
import type { HttpMethod } from "../types/types.js";

export class Request {
  public method: HttpMethod;
  public url: string;
  public body: any = {};
  public params: Record<string, string> = {};

  constructor(public raw: IncomingMessage) {
    this.method = (raw.method as HttpMethod) || "GET";
    this.url = raw.url || "/";
  }

  get path() {
    return this.url.split("?")[0] || "/";
  }

  get query() {
    const queryString = this.url.split("?")[1] || "";
    const searchParams = new URLSearchParams(queryString);
    const queryObj: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      queryObj[key] = value;
    }
    return queryObj;
  }
}

