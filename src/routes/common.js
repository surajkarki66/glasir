import { Router } from "express";

import { CommonController } from "../controllers/index";
import { authValidation, permissions } from "../middlewares/index";

const router = new Router();

router
  .route("/me")
  .get(authValidation.checkAuth)
  .get(permissions.noAdminCanDoThisAction)
  .get(CommonController.me);

export default router;
