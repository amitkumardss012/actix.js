import type { ServerResponse } from "node:http";
import type { CookieOptions } from "../types/types.js";

export class Response {
  constructor(public raw: ServerResponse) {}

  send(data: string) {
    this.raw.end(data); 
  }

  json(data: any) {
    this.raw.setHeader("Content-Type", "application/json");
    this.raw.end(JSON.stringify(data));
  }

  status(code: number) {
    this.raw.statusCode = code;
    return this;
  }

  redirect(url: string) {
    this.raw.setHeader("Location", url);
    this.raw.statusCode = 302;
    this.raw.end();
  }

  setCookie(name: string, value: string, options?: CookieOptions) {
    let cookie = `${name}=${value}`;
    if (options?.httpOnly) cookie += "; HttpOnly";
    if (options?.secure) cookie += "; Secure";
    if (options?.path) cookie += `; Path=${options.path}`;
    if (options?.domain) cookie += `; Domain=${options.domain}`;
    if (options?.maxAge) cookie += `; Max-Age=${options.maxAge}`;
    if (options?.sameSite) cookie += `; SameSite=${options.sameSite}`;
    this.raw.setHeader("Set-Cookie", cookie);
  }

  setHeader(name: string, value: string) {
    this.raw.setHeader(name, value);
  }

  removeHeader(name: string) {
    this.raw.removeHeader(name);
  }

  end() {
    this.raw.end();
  }
}
