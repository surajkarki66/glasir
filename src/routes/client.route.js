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
  .post(dataValidation(Schemas.clientSchema.clientCREATE, "body"))
  .post(ClientController.createClientProfile);

router
  .route("/get-clients")
  .get(authValidation.checkAuth)
  .get(permissions.onlyAdminCanDoThisAction)
  .get(dataValidation(Schemas.clientSchema.clientLIST, "query"))
  .get(ClientController.getClients);

export default router;
