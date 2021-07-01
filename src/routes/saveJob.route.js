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

router
  .route("/unsavedJob")
  .post(checkAuth)
  .post(freelancerPermissions.onlyFreelancerCanDoThisAction)
  .post(dataValidation(Schemas.saveJobSchema.saveJobDELETE, "body"))
  .post(SaveJobController.unsavedJob);

router
  .route("/saved")
  .post(checkAuth)
  .post(freelancerPermissions.onlyFreelancerCanDoThisAction)
  .post(dataValidation(Schemas.saveJobSchema.saveJobSAVED, "body"))
  .post(SaveJobController.savedJob);

export default router;
