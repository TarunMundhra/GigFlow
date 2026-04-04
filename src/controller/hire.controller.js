import mongoose from "mongoose";
import { Bid } from "../models/bid.model.js";
import { Gig } from "../models/gig.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const hireBid = asyncHandler(async (req, res) => {
  const { bidId } = req.params;
  const ownerId = req.user?._id;

  if (!bidId) {
    throw new ApiError(400, "Bid ID is required");
  }

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized: User information is missing");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const bid = await Bid.findById(bidId).session(session);
      if (!bid) {
        throw new ApiError(404, "Bid not found");
      }

      const gig = await Gig.findById(bid.gig).session(session);
      if (!gig) {
        throw new ApiError(404, "Gig not found for this bid");
      }

      if (!gig.owner.equals(ownerId)) {
        throw new ApiError(
          403,
          "Forbidden: Only the gig owner can hire a freelancer",
        );
      }

      if (gig.status !== "open") {
        throw new ApiError(409, "Gig has already been assigned");
      }

      const hiredBid = await Bid.findOneAndUpdate(
        {
          _id: bidId,
          gig: gig._id,
          status: "pending",
        },
        { $set: { status: "hired" } },
        { session, new: true },
      );

      if (!hiredBid) {
        throw new ApiError(404, "Bid not found or already processed");
      }

      await Gig.findByIdAndUpdate(
        gig._id,
        { $set: { status: "assigned" } },
        { session },
      );

      await Bid.updateMany(
        {
          gig: gig._id,
          _id: { $ne: bidId },
        },
        { $set: { status: "rejected" } },
        { session },
      );
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Freelancer hired successfully"));
  } finally {
    session.endSession();
  }
});
