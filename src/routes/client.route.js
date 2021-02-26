import { Router } from "express";

import { ClientController } from "../controllers/index";
import { Schemas } from "../helpers/schemas/index";
import {
  dataValidation,
  authValidation,
  permissions,
} from "../middlewares/index";

const router = new Router();

router
  .route("/create-profile")
  .post(authValidation.checkAuth)
  .post(
    permissions.onlyActiveUserCanDoThisAction,
    permissions.onlyClientCanDoThisAction,
  )
  .post(dataValidation(Schemas.clientSchema.createClient, "body"))
  .post(ClientController.createClientProfile);

export default router;
