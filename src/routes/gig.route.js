import { Router } from "express";
import { createGig , getAllGigs } from "../controller/gig.controller.js";
import { hireBid } from "../controller/hire.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use((req, res, next) => {
  console.log(`Incoming request to gig route: ${req.method} ${req.url}`);
  next();
});

router.post("/", verifyJWT, createGig);
router.get("/", getAllGigs);

export default router;