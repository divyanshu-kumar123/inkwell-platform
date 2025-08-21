import mongoose, {Schema} from "mongoose";

const PostSchema = new Schema(
    {
        title : {
            type : String,
            required: true,
            trim: true
        },
        content : {
           type : String,
           required: true,
        },
        publication : {
            type : Schema.Types.ObjectId,
            ref : "Publication",
            required: true
        },
        author : {
            type : Schema.Types.ObjectId,
            ref : "User",
            required: true
        },
        accessLevel : {
            type : String,
            enum : ['PUBLIC', 'PAID'],
            default : 'PUBLIC'
        },
        status : {
            type : String,
            enum : ['DRAFT', 'PUBLISHED'],
            default : 'DRAFT'
        }
    },
    {
        timestamps : true
    }
)

export const Post = mongoose.model("Post", PostSchema);