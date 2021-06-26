import { Router } from "express";

import JobController from "../controllers/job.controller";
import Schemas from "../helpers/schemas/index";
import validations, { permissions, file } from "../middlewares/index";

const router = new Router();

const { checkAuth, dataValidation } = validations;
const { authPermissions, clientPermissions } = permissions;

router
  .route("/createJob")
  .post(checkAuth)
  .post(
    authPermissions.onlyActiveUserCanDoThisAction,
    clientPermissions.onlyClientCanDoThisAction,
  )
  .post(dataValidation(Schemas.jobSchema.jobCREATE, "body"))
  .post(JobController.createJob);
router
  .route("/get-jobs")
  .get(checkAuth)
  .get(dataValidation(Schemas.jobSchema.jobLIST, "query"))
  .get(JobController.getJobs);

export default router;
