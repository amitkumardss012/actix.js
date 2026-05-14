import type { Request } from "../http/request.js";
import type { Response } from "../http/response.js";

export function hellow(req: Request, res: Response) {
  return res.json({ message: "Hellow World" });
}

export function testMiddleware(req: Request, res: Response, next: () => void) {
  console.log("Middleware");
  return res.json({ message: "Middleware" });
}

export function testMiddleware2(req: Request, res: Response) {
  console.log("Middleware2");
  return res.json({ message: "Middleware2" });
}
