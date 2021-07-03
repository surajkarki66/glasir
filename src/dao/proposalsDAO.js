import { ObjectId } from "mongodb";

import logger from "../configs/logger";
import config from "../configs/config";

class ProposalsDAO {
  static #proposals;

  static async injectDB(conn) {
    if (ProposalsDAO.#proposals) {
      return;
    }
    try {
      ProposalsDAO.#proposals = await conn
        .db(config.database)
        .collection("proposals");
      logger.info(
        `Connected to proposals collection of ${config.database} database.`,
        "ProposalsDAO.injectDB()",
      );
    } catch (e) {
      logger.error(
        `Error while injecting DB: ${e.message}`,
        "ProposalsDAO.injectDB()",
      );
      throw e;
    }
  }
  static async createProposal(proposalInfo) {
    try {
      const result = await ProposalsDAO.#proposals.insertOne(proposalInfo);
      if (result && result.insertedCount === 1) {
        const data = result.ops[0];
        return {
          success: true,
          data: data,
          statusCode: 201,
        };
      } else {
        return {
          success: false,
          data: {
            error: "Proposal is not created",
          },
          statusCode: 500,
        };
      }
    } catch (error) {
      logger.error(
        `Error occurred while creating a proposal, ${error.message}.`,
      );
      throw error;
    }
  }
  static async getProposalByFreelancerIdAndJobId(freelancerId, jobId) {
    return await ProposalsDAO.#proposals.findOne({
      job: ObjectId(jobId),
      freelancer: ObjectId(freelancerId),
    });
  }
}

export default ProposalsDAO;
