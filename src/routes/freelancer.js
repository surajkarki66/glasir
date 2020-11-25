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
  .route("/make-profile")
  .post(authValidation.checkAuth)
  .post(permissions.onlyFreelancerCanDoThisAction)
  .post(dataValidation(Schemas.freelancerSchema.createProfile, "body"))
  .post(FreelancerController.makeProfile);

router
  .route("/upload-doc/:id")
  .patch(authValidation.checkAuth)
  .patch(
    permissions.onlyFreelancerCanDoThisAction,
    permissions.onlySameFreelancerCanDoThisAction
  )
  .patch(
    file
      .fileUpload("../../../public/uploads/", [
        "application/pdf",
        "application/docx",
      ])
      .fields([
        { name: "citizenship", maxCount: 1 },
        { name: "resume", maxCount: 1 },
      ])
  )
  .patch(FreelancerController.uploadDocument);

export default router;
