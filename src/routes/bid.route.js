import { Router } from "express";
import { placeBid, getAllBidsForGig } from "../controller/bid.controller.js";
import { hireBid } from "../controller/hire.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use((req, res, next) => {
  console.log(`Incoming request to bid route: ${req.method} ${req.url}`);
  next();
});

router.post("/bids", verifyJWT, placeBid);
router.get("/:gigId/bids", verifyJWT, getAllBidsForGig);
router.post("/:gigId/bids/:bidId/hire", verifyJWT, hireBid);
export default router;
