import { Router } from "express";

import { FreelancerController } from "../controllers/index";
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
  .post(permissions.onlyFreelancerCanDoThisAction)
  .post(dataValidation(Schemas.freelancerSchema.createProfile, "body"))
  .post(FreelancerController.makeProfile);

router
  .route("/get-freelancers")
  .get(authValidation.checkAuth)
  .get(dataValidation(Schemas.freelancerSchema.freelancerLIST, "query"))
  .get(FreelancerController.getFreelancers);

router
  .route("/search")
  .get(authValidation.checkAuth)
  .get(dataValidation(Schemas.freelancerSchema.freelancerSEARCH, "query"))
  .get(FreelancerController.searchFreelancer);

router
  .route("/upload-avatar/:freelancerId")
  .post(authValidation.checkAuth)
  .post(dataValidation(Schemas.freelancerSchema.avatarUPLOAD, "params"))
  .post(
    permissions.onlyFreelancerCanDoThisAction,
    permissions.onlySameFreelancerCanDoThisAction,
  )
  .post(
    file
      .fileUpload("../../../public/uploads/", ["image/jpeg", "image/jpg"])
      .single("avatar"),
  )
  .post(FreelancerController.uploadAvatar);

router
  .route("/upload-doc/:freelancerId")
  .post(authValidation.checkAuth)
  .post(
    permissions.onlyFreelancerCanDoThisAction,
    permissions.onlySameFreelancerCanDoThisAction,
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
  .route("/me")
  .get(authValidation.checkAuth)
  .get(permissions.onlyFreelancerCanDoThisAction)
  .get(FreelancerController.me);

router
  .route("/:freelancerId")
  .get(authValidation.checkAuth)
  .get(dataValidation(Schemas.freelancerSchema.freelancerDETAILS, "params"))
  .get(FreelancerController.getFreelancerDetails);

router
  .route("/:freelancerId")
  .patch(authValidation.checkAuth)
  .patch(
    permissions.onlyFreelancerCanDoThisAction,
    permissions.onlySameFreelancerCanDoThisAction,
  )
  .patch(dataValidation(Schemas.freelancerSchema.freelancerUPDATE, "body"))
  .patch(FreelancerController.changeFreelancerDetails);

router
  .route("/add-employment/:freelancerId")
  .patch(authValidation.checkAuth)
  .patch(
    permissions.onlyFreelancerCanDoThisAction,
    permissions.onlySameFreelancerCanDoThisAction,
  )
  .patch(dataValidation(Schemas.freelancerSchema.employmentCREATE, "body"))
  .patch(FreelancerController.addEmployment);

router
  .route("/update-employment/:freelancerId")
  .patch(authValidation.checkAuth)
  .patch(
    permissions.onlyFreelancerCanDoThisAction,
    permissions.onlySameFreelancerCanDoThisAction,
  )
  .patch(dataValidation(Schemas.freelancerSchema.employmentUPDATE, "body"))
  .patch(FreelancerController.updateEmployment);

router
  .route("/verifyPhoneNumber")
  .post(authValidation.checkAuth)
  .post(dataValidation(Schemas.freelancerSchema.phoneNumberVERIFY, "body"))
  .post(FreelancerController.verifyPhoneNumber);

router
  .route("/confirm-phone-number")
  .post(dataValidation(Schemas.freelancerSchema.phoneNumberCONFIRM, "body"))
  .post(authValidation.checkAuth)
  .post(
    permissions.onlyFreelancerCanDoThisAction,
    permissions.onlySameFreelancerCanDoThisAction,
  )
  .post(FreelancerController.confirmPhoneNumber);

export default router;
