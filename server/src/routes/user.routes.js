import { Router } from 'express';
import {registerUser} from '../controllers/user.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.route("/register").get(asyncHandler(registerUser));

export default router