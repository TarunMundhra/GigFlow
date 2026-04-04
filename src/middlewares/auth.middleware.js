import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    console.log(token);
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      //TODO: discuss about frontend
      throw new ApiError(401, "Invalid Access token");
    }

    req.user = user; //new object added in req as per our wish = user gives access to user
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
