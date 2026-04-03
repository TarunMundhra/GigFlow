import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getUser,
    updateAccount,
} from "../controller/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { verify } from "jsonwebtoken";
const router = Router();

router.use((req, res, next) => {
  console.log(`Incoming request to user route: ${req.method} ${req.url}`);
  next();
});

router.route("/auth/register").post(registerUser);

router.route("/auth/login").post(loginUser);

//secured routes
router.route("/auth/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changePassword);
router.route("/me").get(verifyJWT, getUser);
router.route("/update-account").patch(verifyJWT, updateAccount);

export default router;
