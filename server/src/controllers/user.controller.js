import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

//Register
//@route POST - /api/v1/users/register
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    //checking if any fields are empty
    if ([username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All the fields are required");
    }

    //if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    //create new user
    const user = await User.create({ username, email, password })

    //get the registered user
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
}

// Login
//@Route Post - api/v1/users/login

const loginUser = async (req, res) => {
    const { username, email, password } = req.body;

    //validations
    if (!(username || email)) {
        throw new ApiError(400, "Username or Email is required");
    }
    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    //Find user in database
    const loggedUser = await User.findOne({ $or: [{ username }, { email }] });

    if (!loggedUser) {
        throw new ApiError(401, "Invalid Credentials! User not found")
    }

    //Match the password
    const isPasswordValid = await loggedUser.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Credentials! User not found")
    }

    const accessToken = loggedUser.generateAccessToken();
    const refreshToken = loggedUser.generateRefreshToken();
    loggedUser.refreshToken = refreshToken;
    await loggedUser.save({ validateBeforeSave: false });

    //get the loggedinuser
    const user = await User.findById(loggedUser._id).select("-password -refreshToken");

    //Define cookie options
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" // Use secure cookies in production
    };

    //Send response with cookies and user data
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: user, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
}

//Logout
//Route Post  api/v1/users/logout

const logoutUser = async (req, res) => {
    //find user and remove the refreshtoken
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        { new: true }
    );

    //cookie options
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    // Clear the access and refresh tokens from the client's browser
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
}

//Refresh Token
const refreshAccessToken = async (req, res) => {
    //Get the refresh token from the client's cookies
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request: No refresh token");
    }

    try {
        //Verify the refresh token
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        //Find the user based on the decoded token's ID
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        //Check if the incoming token matches the one in the database
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        //Generate new tokens
        const accessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();

        //Update the user's refresh token
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully"
                )
            );

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
};


//get the current user
//Route get - api/v1/users/current-user
const getCurrentUser = async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
};


//become a creator - change the existing role from reader to creator
const becomeCreator = async (req, res) => {
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { role: 'CREATOR' } },
        { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    if (updatedUser.role !== 'CREATOR') {
        throw new ApiError(500, "Something went wrong.")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { user: updatedUser }, "User role upgraded to Creator successfully"));
}

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    becomeCreator
}
