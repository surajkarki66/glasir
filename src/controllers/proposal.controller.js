import { ObjectId } from "mongodb";

import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";
import { writeServerResponse } from "../helpers/response";

async function createProposal(req, res, next) {
  try {
    const { freelancerId, jobId, bidType } = req.body;
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
      freelancerId: ObjectId(freelancerId),
      jobId: ObjectId(jobId),
      additionalFiles: newAdditionalFiles,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    let newProposalInfo = {};
    if (bidType === "fixed") {
      newProposalInfo = {
        ...proposalInfo,
        fixedBidAmount: {
          currencyCode: "USD",
          amount: proposalInfo.fixedBidAmount,
        },
      };
    } else {
      newProposalInfo = {
        ...proposalInfo,
        hourlyBidAmount: {
          currencyCode: "USD",
          amount: proposalInfo.hourlyBidAmount,
        },
      };
    }
    const { success, data, statusCode } =
      await DAOs.proposalsDAO.createProposal(newProposalInfo);
    if (success) {
      await DAOs.jobsDAO.addProposalId(data._id, jobId);
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
    const { jobId, freelancerId } = req.params;
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

async function withdrawProposal(req, res, next) {
  try {
    const { proposalId } = req.params;
    const proposal = await DAOs.proposalsDAO.getProposalByProposalId(
      proposalId,
    );
    if (proposal && proposal.status === "accepted") {
      next(ApiError.forbidden("Accepted proposal is not allowed to withdraw."));
      return;
    }

    const { success } = await DAOs.proposalsDAO.deleteProposalById(proposalId);
    if (success) {
      await DAOs.jobsDAO.removeProposalId(proposalId, proposal.jobId);
      const serverResponse = {
        status: "success",
        data: { message: "Deleted successfully." },
      };
      return writeServerResponse(res, serverResponse, 200, "application/json");
    }
    next(ApiError.notfound("Proposal doesn't exist."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
async function getFreelancerProposals(req, res, next) {
  try {
    const { page, proposalsPerPage, freelancerId, status } = req.query;
    const filter = { freelancerId: ObjectId(freelancerId), status: status };
    const {
      success,
      data,
      totalProposalsCount,
      totalProposalsCountInPage,
      statusCode,
    } = await DAOs.proposalsDAO.getProposals({
      filter,
      page,
      proposalsPerPage,
    });
    if (success) {
      const serverResponse = {
        status: "success",
        proposals: data,
        page: parseInt(page),
        filters: filter,
        entriesPerPage: parseInt(proposalsPerPage),
        totalResultsInPage: totalProposalsCountInPage,
        totalResults: totalProposalsCount,
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
async function getJobProposals(req, res, next) {
  try {
    const { page, proposalsPerPage, jobId, proposalStatus } = req.query;
    const filter = { jobId: ObjectId(jobId), status: proposalStatus };
    const {
      success,
      data,
      totalProposalsCount,
      totalProposalsCountInPage,
      statusCode,
    } = await DAOs.proposalsDAO.getProposalByJobId({
      filter,
      page,
      proposalsPerPage,
    });
    if (success) {
      const serverResponse = {
        status: "success",
        proposals: data,
        page: parseInt(page),
        entriesPerPage: parseInt(proposalsPerPage),
        totalResultsInPage: totalProposalsCountInPage,
        totalResults: totalProposalsCount,
        filters: filter,
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

async function getJobProposalDetails(req, res, next) {
  try {
    const { proposalId } = req.params;
    const { success, data, statusCode } =
      await DAOs.proposalsDAO.getJobProposalById(proposalId);

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
async function changeProposalDetails(req, res, next) {
  try {
    const { bidType } = req.body;
    const { proposalId } = req.params;

    let proposalDetails = {
      ...req.body,
      updatedAt: new Date(),
    };
    if (bidType === "fixed") {
      proposalDetails = {
        ...proposalDetails,
        fixedBidAmount: {
          currencyCode: "USD",
          amount: proposalDetails.fixedBidAmount,
        },
      };
    } else {
      proposalDetails = {
        ...proposalDetails,
        hourlyBidAmount: {
          currencyCode: "USD",
          amount: proposalDetails.hourlyBidAmount,
        },
      };
    }

    const { success, data, statusCode } =
      await DAOs.proposalsDAO.updateProposal(proposalId, proposalDetails);
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
export default {
  createProposal,
  isProposalExist,
  getProposalDetails,
  withdrawProposal,
  getFreelancerProposals,
  getJobProposals,
  getJobProposalDetails,
  changeProposalDetails,
};
