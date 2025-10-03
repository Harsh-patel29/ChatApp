import express from "express";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";

dotenv.config();
const app = express();

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

import userRoute from "./routes/user.routes.js";

app.use("/api/v1/user", userRoute);

export { app };
