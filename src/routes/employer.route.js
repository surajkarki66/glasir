import { Router } from "express";

import EmployerController from "../controllers/employer.controller";
import Schemas from "../helpers/schemas/index";
import validations, { permissions, file } from "../middlewares/index";

const router = new Router();

const { checkAuth, dataValidation } = validations;
const { authPermissions, employerPermissions } = permissions;

router
  .route("/create-profile")
  .post(checkAuth)
  .post(
    authPermissions.onlyActiveUserCanDoThisAction,
    employerPermissions.onlyEmployerCanDoThisAction,
  )
  .post(dataValidation(Schemas.employerSchema.employerCREATE, "body"))
  .post(EmployerController.createEmployerProfile);

router
  .route("/get-employers")
  .get(checkAuth)
  .get(authPermissions.onlyAdminCanDoThisAction)
  .get(dataValidation(Schemas.employerSchema.employerLIST, "query"))
  .get(EmployerController.getEmployers);

router
  .route("/:employerId")
  .get(checkAuth)
  .get(dataValidation(Schemas.employerSchema.employerDETAILS, "params"))
  .get(EmployerController.getEmployerDetails);

router
  .route("/update-profile/:employerId")
  .patch(checkAuth)
  .patch(
    authPermissions.onlyActiveUserCanDoThisAction,
    employerPermissions.onlyEmployerCanDoThisAction,
    employerPermissions.onlySameEmployerCanDoThisAction,
  )
  .patch(dataValidation(Schemas.employerSchema.employerUPDATE, "body"))
  .patch(EmployerController.changeEmployerDetails);

router
  .route("/upload-avatar/:employerId")
  .post(checkAuth)
  .post(dataValidation(Schemas.employerSchema.avatarUPLOAD, "params"))
  .post(
    employerPermissions.onlyEmployerCanDoThisAction,
    employerPermissions.onlySameEmployerCanDoThisAction,
  )
  .post(
    file
      .fileUpload("../../../public/uploads/avatars/employers", [
        "image/jpeg",
        "image/jpg",
        "image/png",
      ])
      .single("avatar"),
  )
  .post(EmployerController.uploadEmployerAvatar);

router
  .route("/verify-phone-number")
  .post(checkAuth)
  .post(employerPermissions.onlyEmployerCanDoThisAction)
  .post(dataValidation(Schemas.employerSchema.phoneNumberVERIFY, "body"))
  .post(EmployerController.verifyEmployerPhoneNumber);

router
  .route("/confirm-phone-number")
  .post(dataValidation(Schemas.employerSchema.phoneNumberCONFIRM, "body"))
  .post(checkAuth)
  .post(
    authPermissions.onlyActiveUserCanDoThisAction,
    employerPermissions.onlyEmployerCanDoThisAction,
    employerPermissions.onlySameEmployerCanDoThisAction,
  )
  .post(EmployerController.confirmEmployerPhoneNumber);

export default router;
