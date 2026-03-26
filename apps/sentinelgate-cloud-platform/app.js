import express from "express";
import router from "./routers/router.js";
import { requestContextMiddleware } from "./middleware/request-context.js";

const app = express();

app.use(express.json());
app.use(requestContextMiddleware);
app.use(router);

export default app;
