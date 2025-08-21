import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

//To register user
//@route POST - /api/v1/users/register
const registerUser = async (req, res) =>{
    const {username, email, password} = req.body;

    //checking if any fields are empty
    if([username, email, password].some((field)=>field?.trim()==="")){
        throw new ApiError(400, "All the fields are required");
    }

    //if user already exists
    const existingUser = await User.findOne({$or :[{username}, {email}]});
    if(existingUser){
        throw new ApiError(409, "User with this email or username already exists");
    }

    //create new user
    const user = await User.create({username, email, password})

    //get the registered user
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
}

export {registerUser}