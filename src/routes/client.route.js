import { Router } from "express";

import { ClientController } from "../controllers/index";
import { Schemas } from "../helpers/schemas/index";
import {
  dataValidation,
  authValidation,
  permissions,
  file,
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

router
  .route("/:clientId")
  .get(authValidation.checkAuth)
  .get(dataValidation(Schemas.clientSchema.clientDETAILS, "params"))
  .get(ClientController.getClientDetails);

router
  .route("/update-profile/:clientId")
  .patch(authValidation.checkAuth)
  .patch(
    permissions.onlyActiveUserCanDoThisAction,
    permissions.onlyClientCanDoThisAction,
    permissions.onlySameClientCanDoThisAction,
  )
  .patch(dataValidation(Schemas.clientSchema.clientUPDATE, "body"))
  .patch(ClientController.changeClientDetails);

router
  .route("/upload-avatar/:clientId")
  .post(authValidation.checkAuth)
  .post(dataValidation(Schemas.clientSchema.avatarUPLOAD, "params"))
  .post(
    permissions.onlyClientCanDoThisAction,
    permissions.onlySameClientCanDoThisAction,
  )
  .post(
    file
      .fileUpload("../../../public/uploads/", ["image/jpeg", "image/jpg"])
      .single("avatar"),
  )
  .post(ClientController.uploadClientAvatar);

router
  .route("/verify-phone-number")
  .post(authValidation.checkAuth)
  .post(permissions.onlyClientCanDoThisAction)
  .post(dataValidation(Schemas.clientSchema.phoneNumberVERIFY, "body"))
  .post(ClientController.verifyClientPhoneNumber);

router
  .route("/confirm-phone-number")
  .post(dataValidation(Schemas.clientSchema.phoneNumberCONFIRM, "body"))
  .post(authValidation.checkAuth)
  .post(
    permissions.onlyActiveUserCanDoThisAction,
    permissions.onlyClientCanDoThisAction,
    permissions.onlySameClientCanDoThisAction,
  )
  .post(ClientController.confirmClientPhoneNumber);

export default router;
