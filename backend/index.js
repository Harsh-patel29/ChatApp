import { app } from "./src/app.js";
import { auth } from "./src/utils/auth.js";
import { ApiError } from "./src/utils/ApiError.js";
import { ApiResponse } from "./src/utils/ApiResponse.js";
import { fromNodeHeaders } from "better-auth/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log("App is listening to", `http://localhost:${port}`);
});

app.get("/api/me", async (req, res) => {
  // await prisma.user.deleteMany();
  // console.log("headers", req.headers);
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    return res.status(200).json(new ApiResponse(200, session, session));
  } catch (error) {
    console.log("error", error);
    throw new ApiError(500, "s", error);
  }
});
