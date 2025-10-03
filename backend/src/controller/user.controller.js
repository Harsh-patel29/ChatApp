import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { auth } from "../utils/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export const signUpUser = AsyncHandler(async (req, res) => {
  const { name, email, password, image } = req.body;
  try {
    const createUser = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        image,
      },
    });
    console.log(createUser);
    return res
      .status(200)
      .json(new ApiResponse(200, "User created Successfully", createUser));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something Went Wrong while creating user", error);
  }
});

export const signInUser = AsyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  try {
    const user = await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe,
      },
      headers: fromNodeHeaders(req.headers),
      returnHeaders: true,
    });

    console.log(user.headers);
    if (user.headers) {
      const setCookieHeader = user.headers.get("set-cookie");
      if (setCookieHeader) {
        res.setHeader("set-cookie", setCookieHeader);
      }
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "User signenIn Successfully", user));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something Went Wrong while signing user", error);
  }
});
