import mongoose from "mongoose";
import { Bid } from "../models/bid.model.js";
import { Gig } from "../models/gig.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const hireBid = asyncHandler(async (req, res) => {
  const { gigId, bidId } = req.params;
  const ownerId = req.user.id;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Atomically assign gig (ONLY if still open)
      const gig = await Gig.findOneAndUpdate(
        {
          _id: gigId,
          owner: ownerId,
          status: "open"
        },
        { $set: { status: "assigned" } },
        { session, new: true }
      );

      if (!gig) {
        throw new ApiError(409, "Gig already assigned");
      }

      // Mark selected bid as hired
      const hiredBid = await Bid.findOneAndUpdate(
        {
          _id: bidId,
          gig: gigId,
          status: "pending"
        },
        { $set: { status: "hired" } },
        { session, new: true }
      );

      if (!hiredBid) {
        throw new ApiError(404, "Bid not found or already processed");
      }

      // Reject all other bids for the gig
      await Bid.updateMany(
        {
          gig: gigId,
          _id: { $ne: bidId }
        },
        { $set: { status: "rejected" } },
        { session }
      );
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Freelancer hired successfully"));

  } finally {
    session.endSession();
  }
});
