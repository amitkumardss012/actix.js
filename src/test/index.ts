import { Sora } from "../core/app.js";
import { hellow } from "./controller.js";

const app = new Sora();

app.get("/", hellow);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});