import { Router } from "express";
import {
    createPublication,
    getPublicationById,
    getMyPublications,
    updatePublicationDetails,
    updatePublicationLogo,
    deletePublication,
} from "../controllers/publication.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// --- Public Route ---
router.route("/:publicationId").get(asyncHandler(getPublicationById));


// --- Secure Routes
router.use(verifyJWT); //applied to all the routed mentioned below

router.route("/").post(asyncHandler(createPublication));
router.route("/my-publications").get(asyncHandler(getMyPublications));
router
    .route("/:publicationId")
    .patch(asyncHandler(updatePublicationDetails))
    .delete(asyncHandler(deletePublication));
router
    .route("/logo/:publicationId")
    .patch(upload.single("logo"), asyncHandler(updatePublicationLogo));

export default router;