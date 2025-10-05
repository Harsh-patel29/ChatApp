import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/api/auth/error", async (req, res, next) => {
  const error = req.query.error;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  const errorRedirects = {
    signup_disabled: `${frontendUrl}/auth/error?error=no-account`,
    user_not_found: `${frontendUrl}/auth/error?error=user-not-found`,
    invalid_credentials: `${frontendUrl}/auth/error?error=invalid-credentials`,
    session_expired: `${frontendUrl}/auth/error?error=session-expired`,
    oauth_error: `${frontendUrl}/auth/error?error=oauth-error`,
  };

  const redirectUrl =
    errorRedirects[error] || `${frontendUrl}/auth/error?error=auth-failed`;

  res.redirect(redirectUrl);
  next();
});

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

import userRoute from "./routes/user.routes.js";

app.use("/api/auth", userRoute);

export { app };
