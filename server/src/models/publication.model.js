import mongoose, { Schema } from "mongoose";
import {User} from './user.model.js';

const PublicationSchema = new Schema(
    {
        name : {
            type : String,
            required : true,
            trim : true
        },
        description : String,
        logoUrl : String,
        owner : {
            type : Schema.Types.ObjectId,
            ref : 'User',
            required : true
        },
        subscribers : [{
            type : Schema.Types.ObjectId,
            ref : 'User'
        }],
        subscriptionPrice : {
            type : Number,
            default : 0
        }
    },
    {
        timestamps : true
    }
)

export const Publication = mongoose.model("Publication", PublicationSchema);