import { ObjectId } from "mongodb";

import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";
import { writeServerResponse } from "../helpers/response";

async function createProposal(req, res, next) {
  try {
    const { freelancer, job } = req.body;
    const additionalFiles = req.files;
    const newAdditionalFiles = additionalFiles.map((file) => {
      const fileProperties = {
        filename: file.filename,
      };
      return fileProperties;
    });
    if (
      await DAOs.proposalsDAO.getProposalByFreelancerIdAndJobId(freelancer, job)
    ) {
      next(ApiError.badRequest("Proposal is already saved"));
      return;
    }
    const proposalInfo = {
      ...req.body,
      freelancer: ObjectId(freelancer),
      job: ObjectId(job),
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

export default { createProposal };
