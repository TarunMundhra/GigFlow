import {Gig} from "../models/gig.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const createGig = asyncHandler(async (req, res) => {
  const { title, description, budget } = req.body;
  const owner = req.user._id; // Assuming user ID is available in req.user after authentication

  const newGig = new Gig({
    title,
    description,
    budget,
    owner,
  });

  await newGig.save();

  if (!newGig) {
    throw new ApiError(500, "Failed to create gig");
  }

  res
    .status(201)
    .json(new ApiResponse(201, newGig, "Gig created successfully"));
});

const getAllGigs = asyncHandler(async (req, res) => {
  const gigs = await Gig.find().populate("owner", "username email");

  if (!gigs) {
    return res.status(404).json(new ApiResponse(404, null, "No gigs found"));
  }

  if (gigs.length === 0) {
    return res.status(404).json(new ApiResponse(404, null, "No gigs found"));
  }
  res
    .status(200)
    .json(new ApiResponse(200, gigs, "Gigs retrieved successfully"));
});

export { 
    createGig,
    getAllGigs 
};
