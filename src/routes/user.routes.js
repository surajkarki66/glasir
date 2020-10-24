import {
	Router
} from "express";

import {
	UserController
} from "../controllers/index";

const router = new Router();
router
	.route("/signup")
	.post(UserController.signup);

export default router;
