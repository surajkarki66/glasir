import { Router } from "express";

import { CommonController } from "../controllers/index";
import {
  authValidation,
  permissions,
  dataValidation,
} from "../middlewares/index";
import { Schemas } from "../helpers/schemas/index";

const router = new Router();

router
  .route("/me")
  .get(authValidation.checkAuth)
  .get(dataValidation(Schemas.commonSchema.commonME, "body"))
  .get(permissions.onlySameUserCanDoThisAction)
  .get(CommonController.me);

export default router;
