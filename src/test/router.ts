import { Router } from "../router/router.js";
import { getProfile, getUsers } from "./controller.js";

const userRouter = new Router();

userRouter.get("/profile", getProfile);
userRouter.get("/", getUsers);

export default userRouter;