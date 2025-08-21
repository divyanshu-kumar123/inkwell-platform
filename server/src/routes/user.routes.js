import { Router } from 'express';
import {becomeCreator, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser} from '../controllers/user.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

//public routes
router.route("/register").post(asyncHandler(registerUser));
router.route("/login").post(asyncHandler(loginUser));
router.route("/refresh-token").post(asyncHandler(refreshAccessToken));

//secured routes
router.route("/logout").post(verifyJWT, asyncHandler(logoutUser));
router.route("/current-user").get(verifyJWT, asyncHandler(getCurrentUser));
router.route("/become-creator").patch(verifyJWT, asyncHandler(becomeCreator))

export default router