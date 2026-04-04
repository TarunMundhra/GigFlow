import { Router } from "express";
import { placeBid, getAllBidsForGig, getBidsByUser } from "../controller/bid.controller.js";
import { hireBid } from "../controller/hire.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use((req, res, next) => {
  console.log(`Incoming request to bid route: ${req.method} ${req.originalUrl}`);
  console.log("Body:", req.body);
  console.log("Params:", req.params);
  next();
});

router.post("/", verifyJWT, placeBid);
router.get("/user", verifyJWT, getBidsByUser);
router.get("/:gigId", verifyJWT, getAllBidsForGig);
router.patch("/:bidId/hire", verifyJWT, hireBid);
export default router;
