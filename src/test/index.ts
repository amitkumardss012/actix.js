import { Sora } from "../core/app.js";
import {
  logger,
  cors,
  auth,
  isApproved,
  rateLimit,
  isPremium,
  hellow,
  createPost,
} from "./controller.js";
import userRouter from "./router.js";

const app = new Sora();

// ─── Global middleware — runs on EVERY request ─────────────────────────
app.use(logger);
app.use(cors);

// ─── Path-scoped middleware with sub-router ────────────────────────────
// Requests to /api/user/* will go through:
//   logger → cors → auth → isApproved → userRouter
app.use("/api/user", auth, isApproved, userRouter);

// ─── Route with inline middleware ──────────────────────────────────────
// GET /create will go through:
//   logger → cors → rateLimit → isPremium → createPost
app.get("/create", rateLimit, isPremium, createPost);

// ─── Simple route (no extra middleware) ────────────────────────────────
// GET / will go through:
//   logger → cors → hellow
app.get("/", hellow);

// ─── Start server ─────────────────────────────────────────────────────
app.listen(3000, () => {
  console.log("Server is running on port 3000");
  console.log("");
  console.log("Try these routes:");
  console.log("  GET http://localhost:3000/              → global MW → hellow");
  console.log("  GET http://localhost:3000/create        → global MW → rateLimit → isPremium → createPost");
  console.log("  GET http://localhost:3000/api/user      → global MW → auth → isApproved → getUsers");
  console.log("  GET http://localhost:3000/api/user/profile → global MW → auth → isApproved → getProfile");
  console.log("  GET http://localhost:3000/nonexistent   → global MW → 404");
});