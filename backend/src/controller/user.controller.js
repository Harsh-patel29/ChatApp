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
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Account created Successfully!! Please check your email for verification",
          createUser
        )
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something Went Wrong while creating user", error);
  }
});

export const signInSocial = AsyncHandler(async (req, res) => {
  try {
    const data = await auth.api.signInSocial({
      body: {
        provider: "google",
      },
      headers: fromNodeHeaders(req.headers),
      returnHeaders: true,
    });

    if (data.headers) {
      const setCookieHeader = user.headers.get("set-cookie");
      if (setCookieHeader) {
        res.setHeader("set-cookie", setCookieHeader);
      }
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "User signenIn Successfully", data));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something Went Wrong while signing user", error);
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

export const signOut = AsyncHandler(async (req, res) => {
  const logoutUser = await auth.api.signOut({
    headers: fromNodeHeaders(req.headers),
    returnHeaders: true,
  });
  if (logoutUser.headers) {
    const setCookieHeader = logoutUser.headers.get("set-cookie");
    if (setCookieHeader) {
      res.setHeader("set-cookie", setCookieHeader);
    }
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "User LoggedOut Successfully", logoutUser));
});
