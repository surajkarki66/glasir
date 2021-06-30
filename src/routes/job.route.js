import { Router } from "express";

import JobController from "../controllers/job.controller";
import Schemas from "../helpers/schemas/index";
import validations, { permissions, file } from "../middlewares/index";

const router = new Router();

const { checkAuth, dataValidation } = validations;
const { authPermissions, employerPermissions, jobPermissions } = permissions;

router
  .route("/createJob")
  .post(checkAuth)
  .post(
    authPermissions.onlyActiveUserCanDoThisAction,
    employerPermissions.onlyEmployerCanDoThisAction,
  )
  .post(dataValidation(Schemas.jobSchema.jobCREATE, "body"))
  .post(JobController.createJob);
router
  .route("/get-jobs")
  .get(checkAuth)
  .get(dataValidation(Schemas.jobSchema.jobLIST, "query"))
  .get(JobController.getJobs);

router
  .route("/search")
  .get(checkAuth)
  .get(dataValidation(Schemas.jobSchema.jobSEARCH, "query"))
  .get(JobController.searchJob);

router
  .route("/:jobId")
  .get(checkAuth)
  .get(dataValidation(Schemas.jobSchema.jobDETAILS, "params"))
  .get(JobController.getJobDetails);

router
  .route("/update-job/:jobId")
  .patch(checkAuth)
  .patch(
    authPermissions.onlyActiveUserCanDoThisAction,
    employerPermissions.onlyEmployerCanDoThisAction,
    jobPermissions.onlyJobOwnerCanDoThisAction,
  )
  .patch(dataValidation(Schemas.jobSchema.jobUPDATE, "body"))
  .patch(JobController.changeJobDetails);

router
  .route("/delete/:jobId")
  .delete(checkAuth)
  .delete(authPermissions.onlyAdminCanDoThisAction)
  .delete(dataValidation(Schemas.jobSchema.jobDELETE, "params"))
  .delete(JobController.deleteJob);

export default router;
