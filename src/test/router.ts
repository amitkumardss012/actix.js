import { Router } from "../router/router.js";

const userRouter = new Router();

userRouter.get("/home", (req, res) => {
    return res.send("Hellow from user router");
});

export default userRouter;