import mongoose, {Schema} from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema(
    {
        username : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true  //For fast searching

        },
        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true
        },
        password : {
            type : String,
            required : [true, 'Password is Required']
        },
        role : {
            type : String,
            enum : ['READER', 'CREATOR'],
            default : 'READER'
        },
        refreshToken : {
            type : String
        }
    },
    {
        timestamps : true
    }
);

//to only hash password when it is new or modified
UserSchema.pre("save", async function (next) {

    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

//To compare the entered password and hashed password stored in db
UserSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

//To generate access token
UserSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this.id,
            email : this.email,
            username : this.username,
            role : this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//to generate a refresh token
UserSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", UserSchema);