import { Router } from "express";

import { FreelancerController } from "../controllers/index";
import { Schemas } from "../helpers/schemas/index";
import {
  dataValidation,
  authValidation,
  permissions,
  fileUpload,
} from "../middlewares/index";

const router = new Router();

router
  .route("/make-profile")
  //.post(authValidation.checkAuth)
  //.post(permissions.onlyFreelancerCanDoThisAction)
  .post(
    fileUpload("../../../public/uploads/", ["image/jpeg", "image/jpg"]).fields([
      { name: "avatar", maxCount: 1 },
      { name: "citizenship", maxCount: 2 },
    ])
  )

  .post(dataValidation(Schemas.freelancerSchema.createProfile, "body"))
  .post(FreelancerController.makeProfile);

export default router;
