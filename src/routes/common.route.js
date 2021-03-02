import { Router } from "express";

import Schemas from "../helpers/schemas/index";
import CommonController from "../controllers/common.controller";
import validations, { permissions } from "../middlewares/index";

const router = new Router();

const { checkAuth, dataValidation } = validations;
const { authPermissions } = permissions;

router
  .route("/me")
  .get(checkAuth)
  .get(dataValidation(Schemas.commonSchema.commonME, "body"))
  .get(authPermissions.onlySameUserCanDoThisAction)
  .get(CommonController.me);

export default router;
