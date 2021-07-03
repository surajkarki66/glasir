import { ObjectId } from "mongodb";

import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";
import { writeServerResponse } from "../helpers/response";

async function createProposal(req, res, next) {
  try {
    const { freelancerId, jobId } = req.body;
    const additionalFiles = req.files;
    const newAdditionalFiles = additionalFiles.map((file) => {
      const fileProperties = {
        filename: file.filename,
      };
      return fileProperties;
    });
    if (
      await DAOs.proposalsDAO.getProposalByFreelancerIdAndJobId(
        freelancerId,
        jobId,
      )
    ) {
      next(ApiError.badRequest("Proposal is already saved"));
      return;
    }
    const proposalInfo = {
      ...req.body,
      freelancer: ObjectId(freelancerId),
      job: ObjectId(jobId),
      additionalFiles: newAdditionalFiles,
    };
    const { success, data, statusCode } =
      await DAOs.proposalsDAO.createProposal(proposalInfo);
    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: "Proposal is created successfully" },
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
async function isProposalExist(req, res, next) {
  try {
    const { jobId, freelancerId } = req.body;
    const proposal = await DAOs.proposalsDAO.getProposalByFreelancerIdAndJobId(
      freelancerId,
      jobId,
    );
    if (proposal) {
      const serverResponse = {
        status: "success",
        data: { isProposalExist: true },
      };
      return writeServerResponse(res, serverResponse, 200, "application/json");
    }
    const serverResponse = {
      status: "success",
      data: { isProposalExist: false },
    };
    return writeServerResponse(res, serverResponse, 200, "application/json");
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function getMyProposals(req, res, next) {
  try {
    const { page, proposalsPerPage, freelancerId } = req.query;
    const filter = { freelancer: ObjectId(freelancerId) };
    const { success, data, totalNumProposals, statusCode } =
      await DAOs.proposalsDAO.getProposals({
        filter,
        page,
        proposalsPerPage,
      });
    if (success) {
      const serverResponse = {
        status: "success",
        proposals: data,
        page: parseInt(page),
        filters: {},
        entriesPerPage: parseInt(proposalsPerPage),
        totalResults: totalNumProposals,
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    }
    next(ApiError.notfound("Proposals are not found."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function getProposalDetails(req, res, next) {
  try {
    const { proposalId } = req.params;
    const { success, data, statusCode } =
      await DAOs.proposalsDAO.getProposalById(proposalId);

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
    next(ApiError.notfound("Proposal doesn't exist."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
export default {
  createProposal,
  isProposalExist,
  getMyProposals,
  getProposalDetails,
};
