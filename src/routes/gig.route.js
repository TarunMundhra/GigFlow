import { Router } from "express";
import {
  createGig,
  getAllGigs,
  getGigById,
  updateGigAdmins,
} from "../controller/gig.controller.js";
import { hireBid } from "../controller/hire.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use((req, res, next) => {
  console.log(`Incoming request to gig route: ${req.method} ${req.url}`);
  next();
});

router.post("/", verifyJWT, createGig);
router.get("/", getAllGigs);

// Return a single gig by ID for detail or admin pages.
router.get("/:gigId", verifyJWT, getGigById);

// Manage gig administrators: add or remove admins by email/ID.
router.patch("/:gigId/admins", verifyJWT, updateGigAdmins);

export default router;
