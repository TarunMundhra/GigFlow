import { Bid } from "../models/bid.model.js";
import { Gig } from "../models/gig.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const placeBid = asyncHandler(async (req, res) => {
  const { gigId, message, price } = req.body;
  const bidder = req.user?._id;
  const freelancerName = req.user?.name;

  console.log("placeBid payload", {
    gigId,
    message,
    price,
    bidder,
    freelancerName,
  });

  if (!gigId) {
    throw new ApiError(400, "Gig ID is required");
  }

  if (!message || message.trim() === "") {
    throw new ApiError(400, "Bid message is required");
  }

  if (typeof price !== "number" || price <= 0) {
    throw new ApiError(400, "Bid price must be a positive number");
  }

  if (!bidder) {
    throw new ApiError(401, "Unauthorized: Bidder information is missing");
  }

  const gig = await Gig.findById(gigId);
  if (!gig) {
    throw new ApiError(404, "Gig not found");
  }

  if (gig.status !== "open") {
    throw new ApiError(409, "Cannot place a bid on an assigned gig");
  }

  const bid = new Bid({
    gig: gigId,
    bidder,
    freelancerName: freelancerName || "Unknown",
    message: message.trim(),
    price,
  });

  await bid.save();

  res.status(201).json(
    new ApiResponse(
      201,
      {
        _id: bid._id,
        gigId: bid.gig,
        freelancerId: bid.bidder,
        freelancerName: bid.freelancerName,
        message: bid.message,
        price: bid.price,
        status: bid.status,
        createdAt: bid.createdAt,
        updatedAt: bid.updatedAt,
      },
      "Bid created successfully",
    ),
  );
});

const getAllBidsForGig = asyncHandler(async (req, res) => {
  const gigId = req.params.gigId;

  if (!gigId) {
    throw new ApiError(400, "Gig ID is required");
  }

  console.log("getAllBidsForGig", { gigId, userId: req.user?._id });

  const gig = await Gig.findById(gigId).populate("admins", "_id");
  if (!gig) {
    throw new ApiError(404, "Gig not found");
  }

  const isAdmin =
    gig.admins?.some((admin) =>
      admin._id ? admin._id.equals(req.user?._id) : admin.equals(req.user?._id),
    ) || gig.owner.equals(req.user?._id);

  if (!isAdmin) {
    throw new ApiError(403, "Forbidden: Only gig admins can view bids");
  }

  const bids = await Bid.find({ gig: gigId }).populate("bidder", "name email");

  const formattedBids = bids.map((bid) => ({
    _id: bid._id,
    gigId: bid.gig,
    freelancerId: bid.bidder?._id,
    freelancerName: bid.freelancerName || bid.bidder?.name,
    message: bid.message,
    price: bid.price,
    status: bid.status,
    createdAt: bid.createdAt,
    updatedAt: bid.updatedAt,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, formattedBids, "Bids retrieved successfully"));
});

const getBidsByUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const bids = await Bid.find({ bidder: userId })
    .populate({
      path: "gig",
      populate: { path: "owner", select: "name email" },
    })
    .populate("bidder", "name email");

  const formattedBids = bids.map((bid) => ({
    _id: bid._id,
    gigId: bid.gig?._id,
    freelancerId: bid.bidder?._id || bid.bidder,
    freelancerName: bid.freelancerName || bid.bidder?.name,
    message: bid.message,
    price: bid.price,
    status: bid.status,
    createdAt: bid.createdAt,
    updatedAt: bid.updatedAt,
    gig: bid.gig
      ? {
          _id: bid.gig._id,
          title: bid.gig.title,
          description: bid.gig.description,
          budget: bid.gig.budget,
          ownerId: bid.gig.owner?._id || bid.gig.owner,
          ownerName: bid.gig.owner?.name || "",
          status: bid.gig.status,
          createdAt: bid.gig.createdAt,
        }
      : null,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(200, formattedBids, "User bids retrieved successfully"),
    );
});

export { placeBid, getAllBidsForGig, getBidsByUser };
