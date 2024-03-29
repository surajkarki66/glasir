import { ObjectId } from "mongodb";
import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";
import { writeServerResponse } from "../helpers/response";

async function saveJob(req, res, next) {
  try {
    const { jobId, freelancerId } = req.body;
    if (
      await DAOs.saveJobsDAO.getSaveJobByJobIdAndFreelancerId(
        freelancerId,
        jobId,
      )
    ) {
      next(ApiError.badRequest("Job is already saved"));
      return;
    }
    const saveJobInfo = {
      jobId: ObjectId(jobId),
      freelancerId: ObjectId(freelancerId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
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
    const { jobId, freelancerId } = req.body;
    const { success, statusCode, data } = await DAOs.saveJobsDAO.deleteSaveJob(
      freelancerId,
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
    const { jobId, freelancerId } = req.params;
    const job = await DAOs.saveJobsDAO.getSaveJobByJobIdAndFreelancerId(
      freelancerId,
      jobId,
    );
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
    const { page, jobsPerPage, freelancerId } = req.query;

    const filter = { freelancerId: ObjectId(freelancerId) };
    const { success, data, totalJobsCount, totalJobsCountInPage, statusCode } =
      await DAOs.saveJobsDAO.getJobs({ filter, page, jobsPerPage });
    if (success) {
      const serverResponse = {
        status: "success",
        jobs: data,
        page: parseInt(page),
        entriesPerPage: parseInt(jobsPerPage),
        totalResultsInPage: totalJobsCountInPage,
        totalResults: totalJobsCount,
        filters: filter,
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
