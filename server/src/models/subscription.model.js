import mongoose,{Schema} from "mongoose";

const SubscriptionSchema = new Schema(
    {
        reader : {
            type : Schema.Types.ObjectId,
            ref : 'User',
            required: true
        },
        publication : {
            type : Schema.Types.ObjectId,
            ref : 'Publication',
            required: true
        },
        status : {
            type : String,
            enum :  ['ACTIVE', 'INACTIVE', 'CANCELED'],
            default : 'INACTIVE'
        },
        paymentProvider : String,
        providerSubscriptionId : String, //this will be a unique id provided by payment provider 
        currentPeriodEnd : {
            type : Date
        }
    },
    {
        timestamps : true
    }
)

export const Subscription = mongoose.model("Subscription", SubscriptionSchema);