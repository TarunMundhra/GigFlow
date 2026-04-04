import { Gig } from "../models/gig.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const formatGig = (gig) => ({
  _id: gig._id,
  title: gig.title,
  description: gig.description,
  budget: gig.budget,
  ownerId: gig.owner?._id || gig.owner,
  ownerName: gig.owner?.name || gig.owner?.username || "",
  admins: gig.admins
    ? gig.admins.map((admin) =>
        admin?._id ? admin._id.toString() : admin.toString(),
      )
    : [],
  status: gig.status,
  createdAt: gig.createdAt,
  updatedAt: gig.updatedAt,
});

const createGig = asyncHandler(async (req, res) => {
  const { title, description, budget } = req.body;
  const owner = req.user._id;

  if (!title || !description || typeof budget !== "number") {
    throw new ApiError(400, "Title, description and budget are required");
  }

  const newGig = new Gig({
    title,
    description,
    budget,
    owner,
    admins: [owner],
  });

  await newGig.save();

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        formatGig({ ...newGig.toObject(), owner: req.user }),
        "Gig created successfully",
      ),
    );
});

const getAllGigs = asyncHandler(async (req, res) => {
  const gigs = await Gig.find().populate("owner", "name email");

  if (!gigs || gigs.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No gigs found"));
  }

  const formattedGigs = gigs.map(formatGig);
  res
    .status(200)
    .json(new ApiResponse(200, formattedGigs, "Gigs retrieved successfully"));
});

export { createGig, getAllGigs };
