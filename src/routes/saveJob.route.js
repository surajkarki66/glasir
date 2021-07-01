import { Router } from "express";

import SaveJobController from "../controllers/saveJob.controller";
import Schemas from "../helpers/schemas/index";
import validations, { permissions } from "../middlewares/index";

const router = new Router();

const { checkAuth, dataValidation } = validations;
const { freelancerPermissions } = permissions;

router
  .route("/saveJob")
  .post(checkAuth)
  .post(freelancerPermissions.onlyFreelancerCanDoThisAction)
  .post(dataValidation(Schemas.saveJobSchema.saveJobCREATE, "body"))
  .post(SaveJobController.saveJob);

export default router;
