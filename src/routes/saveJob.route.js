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
  .route("/isJobSaved")
  .post(checkAuth)
  .post(freelancerPermissions.onlyFreelancerCanDoThisAction)
  .post(dataValidation(Schemas.saveJobSchema.isJobSAVED, "body"))
  .post(SaveJobController.isJobSaved);

router
  .route("/getSavedJobs")
  .post(checkAuth)
  .post(
    freelancerPermissions.onlyFreelancerCanDoThisAction,
    freelancerPermissions.onlySameFreelancerCanDoThisAction,
  )
  .post(dataValidation(Schemas.saveJobSchema.savedJobsLIST, "query"))
  .post(SaveJobController.getSavedJobs);

export default router;
