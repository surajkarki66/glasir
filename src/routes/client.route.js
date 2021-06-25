import { Router } from "express";

import ClientController from "../controllers/client.controller";
import Schemas from "../helpers/schemas/index";
import validations, { permissions, file } from "../middlewares/index";

const router = new Router();

const { checkAuth, dataValidation } = validations;
const { authPermissions, clientPermissions } = permissions;

router
  .route("/create-profile")
  .post(checkAuth)
  .post(
    authPermissions.onlyActiveUserCanDoThisAction,
    clientPermissions.onlyClientCanDoThisAction,
  )
  .post(dataValidation(Schemas.clientSchema.clientCREATE, "body"))
  .post(ClientController.createClientProfile);

router
  .route("/get-clients")
  .get(checkAuth)
  .get(authPermissions.onlyAdminCanDoThisAction)
  .get(dataValidation(Schemas.clientSchema.clientLIST, "query"))
  .get(ClientController.getClients);

router
  .route("/:clientId")
  .get(checkAuth)
  .get(dataValidation(Schemas.clientSchema.clientDETAILS, "params"))
  .get(ClientController.getClientDetails);

router
  .route("/update-profile/:clientId")
  .patch(checkAuth)
  .patch(
    authPermissions.onlyActiveUserCanDoThisAction,
    clientPermissions.onlyClientCanDoThisAction,
    clientPermissions.onlySameClientCanDoThisAction,
  )
  .patch(dataValidation(Schemas.clientSchema.clientUPDATE, "body"))
  .patch(ClientController.changeClientDetails);

router
  .route("/upload-avatar/:clientId")
  .post(checkAuth)
  .post(dataValidation(Schemas.clientSchema.avatarUPLOAD, "params"))
  .post(
    clientPermissions.onlyClientCanDoThisAction,
    clientPermissions.onlySameClientCanDoThisAction,
  )
  .post(
    file
      .fileUpload("../../../public/uploads/avatars/clients/", [
        "image/jpeg",
        "image/jpg",
      ])
      .single("avatar"),
  )
  .post(ClientController.uploadClientAvatar);

router
  .route("/verify-phone-number")
  .post(checkAuth)
  .post(clientPermissions.onlyClientCanDoThisAction)
  .post(dataValidation(Schemas.clientSchema.phoneNumberVERIFY, "body"))
  .post(ClientController.verifyClientPhoneNumber);

router
  .route("/confirm-phone-number")
  .post(dataValidation(Schemas.clientSchema.phoneNumberCONFIRM, "body"))
  .post(checkAuth)
  .post(
    authPermissions.onlyActiveUserCanDoThisAction,
    clientPermissions.onlyClientCanDoThisAction,
    clientPermissions.onlySameClientCanDoThisAction,
  )
  .post(ClientController.confirmClientPhoneNumber);

export default router;
