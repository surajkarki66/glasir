import { ObjectId } from "mongodb";
import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";
import { writeServerResponse } from "../helpers/response";

async function saveJob(req, res, next) {
  try {
    const { jobId } = req.body;
    const { aud } = req.jwt;
    if (await DAOs.saveJobsDAO.getSaveJobByJobIdAndUserId(aud, jobId)) {
      next(ApiError.badRequest("Job is already saved"));
      return;
    }
    const saveJobInfo = { job: ObjectId(jobId), user: ObjectId(aud) };
    const { success, data, statusCode } = await DAOs.saveJobsDAO.createSaveJob(
      saveJobInfo,
    );
    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: "Job is saved successfully" },
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    }
    return writeServerResponse(
      res,
      { status: "failed", data: data },
      statusCode,
      "application/json",
    );
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function unsavedJob(req, res, next) {
  try {
    const { jobId } = req.body;
    const { aud } = req.jwt;
    const { success, statusCode, data } = await DAOs.saveJobsDAO.deleteSaveJob(
      aud,
      jobId,
    );
    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: "Job is unsaved successfully" },
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    }
    return writeServerResponse(
      res,
      { status: "failed", data: data },
      statusCode,
      "application/json",
    );
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
async function isJobSaved(req, res, next) {
  try {
    const { jobId } = req.body;
    const { aud } = req.jwt;
    const job = await DAOs.saveJobsDAO.getSaveJobByJobIdAndUserId(aud, jobId);
    if (job) {
      const serverResponse = {
        status: "success",
        data: { isSaved: true },
      };
      return writeServerResponse(res, serverResponse, 200, "application/json");
    }
    const serverResponse = {
      status: "success",
      data: { isSaved: false },
    };
    return writeServerResponse(res, serverResponse, 200, "application/json");
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
async function getSavedJobs(req, res, next) {
  try {
    const { page, jobsPerPage } = req.query;
    const { userId } = req.body;
    if (!userId) {
      next(ApiError.badRequest("UserId is required"));
      return;
    }
    const filter = { user: ObjectId(userId) };
    const { success, data, totalNumJobs, statusCode } =
      await DAOs.saveJobsDAO.getJobs({ filter, page, jobsPerPage });
    if (success) {
      const serverResponse = {
        status: "success",
        savedJobs: data,
        page: parseInt(page),
        filters: {},
        entriesPerPage: parseInt(jobsPerPage),
        totalResults: totalNumJobs,
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    }
    next(ApiError.notfound("Jobs are not found."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

export default { saveJob, unsavedJob, isJobSaved, getSavedJobs };
