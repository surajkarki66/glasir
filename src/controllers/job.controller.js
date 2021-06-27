import { ObjectId } from "bson";

import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";
import { writeServerResponse } from "../helpers/response";

async function createJob(req, res, next) {
  try {
    const { aud } = req.jwt;
    const client = await DAOs.clientsDAO.getClientByUserId(aud);
    if (!client) {
      next(ApiError.notfound("Client not found"));
      return;
    }
    const { _id } = client;
    const jobInfo = {
      client: ObjectId(_id),
      ...req.body,
    };
    const { success, data, statusCode } = await DAOs.jobsDAO.createJob(jobInfo);
    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: "Job is created successfully" },
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

async function getJobs(req, res, next) {
  try {
    const { page, jobsPerPage } = req.query;
    const { success, data, totalNumJobs, statusCode } =
      await DAOs.jobsDAO.getJobs({
        page,
        jobsPerPage,
      });
    if (success) {
      const serverResponse = {
        status: "success",
        jobs: data,
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
async function searchJob(req, res, next) {
  try {
    let filters = {};
    const queryArray = Object.keys(req.query);
    const { page, jobsPerPage } = req.query;

    queryArray.some((query) => {
      if (query === "page" || query === "jobsPerPage") {
        return false;
      }
      if (req.query[query] !== "") {
        filters[query] = req.query[query];
      }
    });

    const { success, data, totalNumJobs, statusCode } =
      await DAOs.jobsDAO.getJobs({
        filters,
        page,
        jobsPerPage,
      });

    if (success) {
      const serverResponse = {
        status: "success",
        jobs: data,
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

export default { createJob, getJobs, searchJob };
