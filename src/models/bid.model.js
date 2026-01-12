import mongoose,{Schema} from "mongoose";

const bidSchema = new Schema( {
    gig : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Gig",
        required : true
    },
    bidder : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    message : {
        type : String
    },
    status : {
        type : String,
        enum : ["pending","hired","rejected"],
        default : "pending"
    }
}, 
{ timestamps : true})       

export const Bid = mongoose.model("Bid", bidSchema);