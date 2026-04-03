import { Bid } from "../models/bid.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const placeBid = asyncHandler( async ( req , res ) => {

    const gig = req.params.gigId;
    if(!gig){
        throw new ApiError(400, "Gig ID is required");
    }

    const message  = req.body;
    if(!message){
        throw new ApiError(400, "Bid message is required");
    }

    const bidder = req.user.id;
    if(!bidder){
        throw new ApiError(401, "Unauthorized: Bidder information is missing");
    }

    const bid = new Bid( {
        gig,
        bidder,
        message
    } );

    await bid.save();

    if(!bid){
        throw new ApiError(500, "Failed to create bid");
    }   

    res.
    status(201).
    json(new ApiResponse(201, bid, "Bid created successfully"));
})

const getAllBidsForGig = asyncHandler( async ( req , res ) => {

    const gig = req.params.gigId;
    if(!gig){
        throw new ApiError(400, "Gig ID is required");
    }

    const owner = req.user.id;
    if(!owner){
        throw new ApiError(401, "Unauthorized: Owner information is missing");
    }

    if(owner !== gig.owner){
        throw new ApiError(403, "Forbidden: You are not the owner of this gig");
    }

    const bids = await Bid.find( { gig } ).populate('bidder', 'name email');

    if(!bids){
        throw new ApiError(404, "No bids found for the specified gig");
    }

    res.
    status(200).
    json(new ApiResponse(200, bids, "Bids retrieved successfully"));
})

export{
    placeBid,
    getAllBidsForGig
}