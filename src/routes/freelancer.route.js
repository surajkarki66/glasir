import { Router } from "express";

import FreelancerController from "../controllers/freelancer.controller";
import Schemas from "../helpers/schemas/index";
import validations, { permissions, file } from "../middlewares/index";

const router = new Router();

const { checkAuth, dataValidation } = validations;
const { authPermissions, freelancerPermissions } = permissions;

router
  .route("/create-profile")
  .post(checkAuth)
  .post(
    authPermissions.onlyActiveUserCanDoThisAction,
    freelancerPermissions.onlyFreelancerCanDoThisAction,
  )
  .post(dataValidation(Schemas.freelancerSchema.freelancerCREATE, "body"))
  .post(FreelancerController.createFreelancerProfile);

router
  .route("/get-freelancers")
  .get(checkAuth)
  .get(dataValidation(Schemas.freelancerSchema.freelancerLIST, "query"))
  .get(FreelancerController.getFreelancers);

router
  .route("/search")
  .get(checkAuth)
  .get(dataValidation(Schemas.freelancerSchema.freelancerSEARCH, "query"))
  .get(FreelancerController.searchFreelancer);

router
  .route("/upload-avatar/:freelancerId")
  .post(checkAuth)
  .post(dataValidation(Schemas.freelancerSchema.avatarUPLOAD, "params"))
  .post(
    freelancerPermissions.onlyFreelancerCanDoThisAction,
    freelancerPermissions.onlySameFreelancerCanDoThisAction,
  )
  .post(
    file
      .fileUpload("../../../public/uploads/", ["image/jpeg", "image/jpg"])
      .single("avatar"),
  )
  .post(FreelancerController.uploadFreelancerAvatar);

router
  .route("/upload-doc/:freelancerId")
  .post(checkAuth)
  .post(dataValidation(Schemas.freelancerSchema.documentUPLOAD, "params"))
  .post(
    freelancerPermissions.onlyFreelancerCanDoThisAction,
    freelancerPermissions.onlySameFreelancerCanDoThisAction,
  )
  .post(
    file
      .fileUpload("../../../public/uploads/", [
        "application/pdf",
        "application/docx",
      ])
      .fields([
        { name: "citizenship", maxCount: 1 },
        { name: "resume", maxCount: 1 },
      ]),
  )
  .post(FreelancerController.uploadDocument);

router
  .route("/:freelancerId")
  .get(checkAuth)
  .get(dataValidation(Schemas.freelancerSchema.freelancerDETAILS, "params"))
  .get(FreelancerController.getFreelancerDetails);

router
  .route("/update-profile/:freelancerId")
  .patch(checkAuth)
  .patch(
    authPermissions.onlyActiveUserCanDoThisAction,
    freelancerPermissions.onlyFreelancerCanDoThisAction,
    freelancerPermissions.onlySameFreelancerCanDoThisAction,
  )
  .patch(dataValidation(Schemas.freelancerSchema.freelancerUPDATE, "body"))
  .patch(FreelancerController.changeFreelancerDetails);

router
  .route("/add-employment")
  .post(checkAuth)
  .post(dataValidation(Schemas.freelancerSchema.employmentCREATE, "body"))
  .post(
    authPermissions.onlyActiveUserCanDoThisAction,
    freelancerPermissions.onlyFreelancerCanDoThisAction,
    freelancerPermissions.onlySameFreelancerCanDoThisAction,
  )
  .post(FreelancerController.addEmployment);

router
  .route("/update-employment/:freelancerId")
  .patch(checkAuth)
  .patch(
    authPermissions.onlyActiveUserCanDoThisAction,
    freelancerPermissions.onlyFreelancerCanDoThisAction,
    freelancerPermissions.onlySameFreelancerCanDoThisAction,
  )
  .patch(dataValidation(Schemas.freelancerSchema.employmentUPDATE, "body"))
  .patch(FreelancerController.updateEmployment);

router
  .route("/verify-phone-number")
  .post(checkAuth)
  .post(freelancerPermissions.onlyFreelancerCanDoThisAction)
  .post(dataValidation(Schemas.freelancerSchema.phoneNumberVERIFY, "body"))
  .post(FreelancerController.verifyFreelancerPhoneNumber);

router
  .route("/confirm-phone-number")
  .post(dataValidation(Schemas.freelancerSchema.phoneNumberCONFIRM, "body"))
  .post(checkAuth)
  .post(
    authPermissions.onlyActiveUserCanDoThisAction,
    freelancerPermissions.onlyFreelancerCanDoThisAction,
    freelancerPermissions.onlySameFreelancerCanDoThisAction,
  )
  .post(FreelancerController.confirmFreelancerPhoneNumber);

export default router;
