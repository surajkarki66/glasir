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

export default router;
