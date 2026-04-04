import { Gig } from "../models/gig.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Convert a gig document into the frontend-friendly response shape.
// This includes normalized admin IDs and optional admin user details.
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
  adminUsers: gig.admins
    ? gig.admins.map((admin) => ({
        _id: admin?._id ? admin._id.toString() : admin.toString(),
        name: admin?.name || "Unknown",
        email: admin?.email || "",
      }))
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
  const gigs = await Gig.find()
    .populate("owner", "name email")
    .populate("admins", "name email");

  if (!gigs || gigs.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No gigs found"));
  }

  const formattedGigs = gigs.map(formatGig);
  res
    .status(200)
    .json(new ApiResponse(200, formattedGigs, "Gigs retrieved successfully"));
});

// Fetch a single gig by ID and return the normalized payload for the frontend.
const getGigById = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.gigId)
    .populate("owner", "name email")
    .populate("admins", "name email");

  if (!gig) {
    throw new ApiError(404, "Gig not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, formatGig(gig), "Gig retrieved successfully"));
});

// Update gig admin access. The requester must already be an admin on the gig.
// Supports adding a new admin by email or removing an existing admin by ID.
const updateGigAdmins = asyncHandler(async (req, res) => {
  const { action, adminEmail, adminId } = req.body;
  const userId = req.user._id.toString();

  if (
    !action ||
    (action === "add" && !adminEmail) ||
    (action === "remove" && !adminId)
  ) {
    throw new ApiError(400, "Invalid admin update payload");
  }

  const gig = await Gig.findById(req.params.gigId);
  if (!gig) {
    throw new ApiError(404, "Gig not found");
  }

  const isRequesterAdmin = gig.admins.some(
    (admin) => admin.toString() === userId,
  );
  if (!isRequesterAdmin) {
    throw new ApiError(403, "Only existing gig admins can manage admin access");
  }

  if (action === "add") {
    const userToAdd = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!userToAdd) {
      throw new ApiError(404, "User not found");
    }

    const adminToAddId = userToAdd._id.toString();
    if (gig.admins.some((admin) => admin.toString() === adminToAddId)) {
      throw new ApiError(400, "User is already an admin");
    }

    gig.admins.push(adminToAddId);
  } else if (action === "remove") {
    if (adminId === gig.owner.toString()) {
      throw new ApiError(400, "Cannot remove the gig owner from admins");
    }

    if (!gig.admins.some((admin) => admin.toString() === adminId)) {
      throw new ApiError(404, "Admin not found on this gig");
    }

    gig.admins = gig.admins.filter((admin) => admin.toString() !== adminId);
  } else {
    throw new ApiError(400, "Unknown admin action");
  }

  await gig.save();

  const updatedGig = await Gig.findById(req.params.gigId)
    .populate("owner", "name email")
    .populate("admins", "name email");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formatGig(updatedGig),
        "Gig admins updated successfully",
      ),
    );
});

export { createGig, getAllGigs, getGigById, updateGigAdmins };
