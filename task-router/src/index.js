import express from "express";
import bodyParser from "body-parser";
import { PORT } from "./config/env.js";
import { initRoutes } from "./api/message.controller.js";

const app = express();
app.use(bodyParser.json());

await initRoutes(app);

app.listen(PORT, () => console.log(`Task Router listening on ${PORT}`));
