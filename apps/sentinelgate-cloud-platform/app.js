import express from "express";
import router from "./routers/router.js";
import { requestContextMiddleware } from "./middleware/request-context.js";
import { notFoundMiddleware } from "./middleware/not-found.js";
import { errorHandlerMiddleware } from "./middleware/error-handler.js";

const app = express();

app.use(express.json());
app.use(requestContextMiddleware);
app.use(router);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
