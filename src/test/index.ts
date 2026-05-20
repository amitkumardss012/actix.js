import { Sora } from "../core/app.js";
import { Request } from "../http/request.js";
import { Response } from "../http/response.js";
import type { NextFunction } from "../types/types.js";
import { hellow } from "./controller.js";
import userRouter from "./router.js";

const app = new Sora();

// Global middleware
app.use(async (req: Request, res: Response, next: NextFunction) => {
  console.log(`[Global] Requestsss to ${req.path}`);
  await next();
});

// Path-specific middleware
app.use("/api", async (req: Request, res: Response, next: NextFunction) => {
  console.log(`[API] Path-specific middleware for /api`);
  await next();
});

// Route-specific middlewares
const rateLimit = async (req: Request, res: Response, next: NextFunction) => {
  console.log(`[RateLimit] Checking limits...`);
  await next();
};

const isPremium = async (req: Request, res: Response, next: NextFunction) => {
  console.log(`[Premium] Checking premium status...`);
  await next();
};

const createPost = async (req: Request, res: Response) => {
  console.log(`[Controller] createPost executed`);
  res.json({ success: true, message: "Post created!" });
};

app.get("/", hellow);
app.get("/api/user", (req, res) => res.json({ user: "amit" }));
app.post("/api/create", rateLimit, isPremium, createPost);

app.post("/api/user/{id}/posts/{postId}", (req, res) => {
  res.json({
    params: req.params,
    query: req.query,
    body: req.body
  });
});

app.use("/api/test", rateLimit, userRouter)

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});