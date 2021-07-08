import { ObjectId } from "mongodb";

import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";
import { writeServerResponse } from "../helpers/response";

async function createJob(req, res, next) {
  try {
    const { employer } = req.body;
    const jobInfo = {
      ...req.body,
      employer: ObjectId(employer),
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
async function getEmployerJobs(req, res, next) {
  try {
    const { page, jobsPerPage, employerId, jobStatus } = req.query;
    let filter = { employer: ObjectId(employerId) };
    if (jobStatus) {
      filter = { ...filter, jobStatus: jobStatus };
    }

    const { success, data, totalNumJobs, statusCode } =
      await DAOs.jobsDAO.getEmployerJobs({
        filter,
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

async function getJobDetails(req, res, next) {
  try {
    const { jobId } = req.params;
    const { success, data, statusCode } = await DAOs.jobsDAO.getJobById(jobId);

    if (success) {
      const serverResponse = {
        status: "success",
        data: data,
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    }
    next(ApiError.notfound("Job doesn't exist."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function changeJobDetails(req, res, next) {
  try {
    const { jobId } = req.params;

    let jobDetails = {
      ...req.body,
      updatedAt: new Date(),
    };

    const { success, data, statusCode } = await DAOs.jobsDAO.updateJob(
      jobId,
      jobDetails,
    );
    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: "Updated successfully." },
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    } else {
      next(ApiError.notfound(data.error));
      return;
    }
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
async function deleteJob(req, res, next) {
  try {
    const { jobId } = req.params;

    const { success } = DAOs.jobsDAO.deleteJobById(jobId);

    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: "Deleted successfully." },
      };
      return writeServerResponse(res, serverResponse, 200, "application/json");
    }
    next(ApiError.notfound("Job doesn't exist."));
    return;
  } catch (e) {
    next(ApiError.internal(`Something went wrong: ${e.message}`));
    return;
  }
}

async function hireFreelancer(req, res, next) {
  try {
    const {
      freelancerId,
      jobId,
      employerId,
      contractTitle,
      workDetails,
      bidType,
      fixedBidAmount,
      hourlyBidAmount,
    } = req.body;
    const workDetailsFiles = req.file;
    if (!workDetailsFiles) {
      next(ApiError.badRequest("File not found"));
      return;
    }
    let contractInfo = {
      freelancer: ObjectId(freelancerId),
      employer: ObjectId(employerId),
      job: ObjectId(jobId),
      contractTitle,
      workDetails,
      workDetailsFiles: workDetailsFiles.filename,
      bidType,
      isClosed: false,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (bidType === "fixed") {
      contractInfo = {
        ...contractInfo,
        fixedBidAmount: {
          currencyCode: "USD",
          amount: fixedBidAmount,
        },
      };
    } else {
      contractInfo = {
        ...contractInfo,
        hourlyBidAmount: {
          currencyCode: "USD",
          amount: hourlyBidAmount,
        },
      };
    }
    if (
      await DAOs.contractsDAO.getContractByFreelancerIdAndJobIdAndEmployerId(
        freelancerId,
        jobId,
        employerId,
      )
    ) {
      next(ApiError.badRequest("Freelancer is already hired"));
      return;
    }
    const { success, data, statusCode } =
      await DAOs.contractsDAO.createContract(contractInfo);
    if (success) {
      await Promise.all([
        DAOs.jobsDAO.addFreelancerId(freelancerId, jobId),
        DAOs.freelancersDAO.addJobId(freelancerId, jobId),
      ]);

      const serverResponse = {
        status: "success",
        data: { message: "Freelancer is hired successfully" },
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
  } catch (e) {
    next(ApiError.internal(`Something went wrong: ${e.message}`));
    return;
  }
}

async function isFreelancerHired(req, res, next) {
  try {
    const { jobId, freelancerId } = req.body;
    const job = await DAOs.jobsDAO.isHired(jobId, freelancerId);
    if (job) {
      const serverResponse = {
        status: "success",
        data: { isHired: true },
      };
      return writeServerResponse(res, serverResponse, 200, "application/json");
    }
    const serverResponse = {
      status: "success",
      data: { isHired: false },
    };
    return writeServerResponse(res, serverResponse, 200, "application/json");
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

export default {
  createJob,
  getJobs,
  searchJob,
  getJobDetails,
  changeJobDetails,
  deleteJob,
  getEmployerJobs,
  hireFreelancer,
  isFreelancerHired,
};
