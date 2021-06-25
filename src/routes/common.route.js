import { Router } from "express";

import Schemas from "../helpers/schemas/index";
import CommonController from "../controllers/common.controller";
import validations, { permissions } from "../middlewares/index";

const router = new Router();

const { checkAuth, dataValidation } = validations;
const { authPermissions } = permissions;

router
  .route("/me")
  .post(checkAuth)
  .post(dataValidation(Schemas.commonSchema.commonME, "body"))
  .post(authPermissions.onlySameUserCanDoThisAction)
  .post(CommonController.me);

export default router;
