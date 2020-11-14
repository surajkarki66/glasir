import { Router } from "express";

import { FreelancerController } from "../controllers/index";
import { Schemas } from "../helpers/schemas/index";
import { dataValidation } from "../middlewares/index";

const router = new Router();

router
  .route("/make-profile")
  .post(dataValidation(Schemas.freelancerSchema.createProfile, "body"))
  .post(FreelancerController.makeProfile);

export default router;
