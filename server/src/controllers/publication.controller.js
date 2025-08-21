import { Publication } from "../models/publication.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.JS";
import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { Subscription } from "../models/subscription.model.js";


//creating a publication
//ROUTE - POST /api/v1/publications
const createPublication = async (req, res) => {

    //Check if the user is a creator
    if (req.user.role !== 'CREATOR') {
        throw new ApiError(403, "Forbidden: Only creators can create publications.");
    }

    const { name, description, subscriptionPrice } = req.body;
    //validations
    if (!name || name.trim() === "") {
        throw new ApiError(400, "Publication name is required.");
    }
    //Create the publication document
    const publication = await Publication.create({
        name,
        description: description || "", 
        owner: req.user._id, 
        subscriptionPrice: subscriptionPrice || 0
    });

    if (!publication) {
        throw new ApiError(500, "Something went wrong while creating the publication.");
    }

    return res.status(201).json(
        new ApiResponse(201, publication, "Publication created successfully")
    );
};


// get publication by id
//Route GET /api/v1/publications/:publicationId
const getPublicationById = async(req, res) => {
    const {publicationId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(publicationId)){
        throw new ApiError(400, "Invalid Publication_id")
    }

    //get the publication
    const publication = await Publication.findById(publicationId);

    if(!publication){
        throw new ApiError(404, "Publication not found");
    }

    return res.status(200).json(
        new ApiResponse(200, publication, "Publication fetched successfully")
    );
}

//get the user of publication
//Route GET /api/v1/publications/my-publications
const getMyPublications = async(req, res) => {
    //check if the role is creator or nor
    if(req.user.role !== 'CREATOR'){
        throw new ApiError(403, "Forbidden - You must be a CREATOR")
    }

    const publications = await Publication.find({owner : req.user._id});
    return res.status(200).json(
        new ApiResponse(200, publications, "Publication fetched successfully")
    );
}

//Update Publication details
//Route PATCH /api/v1/publications/:publicationId
const updatePublicationDetails = async (req, res) => {
    const { name, description, subscriptionPrice } = req.body;
    const { publicationId } = req.params;

    //Validate that at least one field to update is provided
    if (!name && !description && subscriptionPrice === undefined) {
        throw new ApiError(400, "At least one field (name, description, or subscriptionPrice) is required to update.");
    }

    //Validate the incoming data
    if (name && name.trim() === "") {
        throw new ApiError(400, "Publication name cannot be empty.");
    }
    if (subscriptionPrice) {
        const price = Number(subscriptionPrice);
        if (isNaN(price) || price < 0) {
            throw new ApiError(400, "Subscription price must be a valid non-negative number.");
        }
    }

    //Create an object with the fields to update
    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;
    if (subscriptionPrice !== undefined) updateFields.subscriptionPrice = subscriptionPrice;

    // 5. Finding the publication by its ID AND the owner ID, then update it
    const updatedPublication = await Publication.findOneAndUpdate(
        { _id: publicationId, owner: req.user._id }, 
        { $set: updateFields }, 
        { new: true } 
    ).select("-subscribers"); // excluding the large field from the response

    if (!updatedPublication) {
        throw new ApiError(404, "Publication not found or you do not have permission to update it.");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedPublication, "Publication details updated successfully")
    );
};

//Update the logo
//Route PATCH /api/v1/publications/logo/:publicationId
const updatePublicationLogo = async (req, res) => {
    const { publicationId } = req.params;

    //Get the local path of the uploaded file from Multer
    const logoLocalPath = req.file?.path;

    if (!logoLocalPath) {
        throw new ApiError(400, "Logo file is required.");
    }

    //Find the publication to ensure the user is the owner
    const publication = await Publication.findById(publicationId);
    if (!publication) {
        throw new ApiError(404, "Publication not found.");
    }
    if (publication.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Forbidden: You are not the owner of this publication.");
    }

    //Upload the new logo to Cloudinary
    const logo = await uploadOnCloudinary(logoLocalPath);
    if (!logo || !logo.url) {
        throw new ApiError(500, "Error while uploading logo to Cloudinary.");
    }

    //Update the publication's logoUrl field in the database
    const updatedPublication = await Publication.findByIdAndUpdate(
        publicationId,
        {
            $set: { logoUrl: logo.url },
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedPublication, "Logo updated successfully")
    );
};
//delete publication
//Route DELETE /api/v1/publications/:publicationId
const deletePublication = async (req, res) => {
    const { publicationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(publicationId)) {
        throw new ApiError(400, "Invalid Publication ID");
    }

    //Find the publication by its ID AND the owner's ID, and delete it.
    const deletedPublication = await Publication.findOneAndDelete({
        _id: publicationId,
        owner: req.user._id,
    });

    if (!deletedPublication) {
        throw new ApiError(404, "Publication not found or you do not have permission to delete it.");
    }

    //Cascade delete: Remove all associated posts and subscriptions.
    await Promise.all([
        Post.deleteMany({ publication: publicationId }),
        Subscription.deleteMany({ publication: publicationId })
    ]);
    return res.status(200).json(
        new ApiResponse(200, {}, "Publication and all its content deleted successfully")
    );
};

export {
    createPublication,
    getMyPublications,
    getPublicationById,
    updatePublicationDetails,
    updatePublicationLogo,
    deletePublication
}