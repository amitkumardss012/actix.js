import type { IncomingMessage } from "node:http";
import type { HttpMethod } from "../types/types.js";

export class Request {
  public method: HttpMethod;
  public url: string;

  constructor(public raw: IncomingMessage) {
    this.method = (raw.method as HttpMethod) || "GET";
    this.url = raw.url || "/";
  }

  get path() {
    return this.url.split("?")[0];
  }

  get query() {
    return this.url.split("?")[1];
  }
}
