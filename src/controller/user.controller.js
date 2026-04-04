import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndrefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(userId);
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while generating AccessToken or refreshToken",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if ([email, name, password].some((field) => !field || field?.trim() === "")) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existedUser = await User.findOne({
    $or: [{ name }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with same name or email already exists");
  }

  const user = await User.create({
    email,
    password,
    name: name.toLowerCase(),
    role,
  });

  const { accessToken, refreshToken } =
    await generateAccessTokenAndrefreshToken(user._id);

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!userCreated) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(201)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        201,
        { user: userCreated, accessToken, refreshToken },
        "User registered successfully",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  // req.body -> data
  // username or email
  // find the user
  //password check
  //access and refresh token renegrate
  // send cookie

  const { email, name, password } = req.body;

  if (!(email || name)) {
    throw new ApiError(400, "Either email or username is  required ");
  }

  const user = await User.findOne({
    $or: [{ email }, { name }],
  });

  if (!user) {
    throw new ApiError(404, "User is not registered or found");
  }

  const validatePassword = await user.isPasswordCorrect(password);

  if (!validatePassword) {
    throw new ApiError(401, "wrong user credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndrefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        `${loggedInUser.role} logged in successfully`,
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //req.user._id //.user created during jwtverify similar to req.body and req.cookie
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true, // allows only server to modify cookies
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(200, {}, ` ${req.user.role} logged out successfully`),
    );
});

const getUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefeshToken = req.cookies.refreshToken || req.body.refreshToken; //req.body for mobile application
  if (!incomingRefeshToken) {
    throw new ApiError(
      401,
      "Invalid RefreshError during regenerating access token",
    );
  }

  try {
    const decodedRefreshToken = jwt.verify(
      incomingRefeshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    // console.log(decodedRefreshToken)
    const user = await User.findById(decodedRefreshToken?._id);

    if (!user) {
      throw new ApiError(401, "user not found while regenerating access token");
    }
    //console.log(user);
    // console.log(user?.refreshToken)
    if (incomingRefeshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    console.log("user validated for refresh token is ", user.name);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken } =
      await generateAccessTokenAndrefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed successfully",
        ),
      );
  } catch (error) {
    console.log("error in refresh token is ", error);
    throw new ApiError(401, error?.message || "Invaild access token 222");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateAccount = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    throw new ApiError(400, "Name and email are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        name: name.toLowerCase(),
        email,
      },
    },
    { new: true },
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User account updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getUser,
  updateAccount,
};
