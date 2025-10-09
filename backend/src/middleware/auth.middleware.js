import { auth } from "../utils/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const verifySession = AsyncHandler(async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      throw new ApiError(401, "User not Authorized", "");
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    console.error("Session Verification Failed", error);
    throw new ApiError(401, "Invalid Session");
  }
  res.json({ user: session.user });
});
