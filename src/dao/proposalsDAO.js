import { ObjectId } from "mongodb";

import logger from "../configs/logger";
import config from "../configs/config";

class ProposalsDAO {
  static #proposals;
  static #DEFAULT_SORT = { createdAt: -1, updatedAt: -1 };
  static #DEFAULT_PROJECT = {
    "job.title": 1,
    status: 1,
    createdAt: 1,
    updatedAt: 1,
  };

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
  static async getProposals({ filter, page = 0, proposalsPerPage = 20 } = {}) {
    let queryParams = {};
    if (filter) {
      queryParams = filter;
    }

    const {
      query = filter,
      project = ProposalsDAO.#DEFAULT_PROJECT,
      sort = ProposalsDAO.#DEFAULT_SORT,
    } = queryParams;
    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "jobs",
          localField: "job",
          foreignField: "_id",
          as: "job",
        },
      },
      {
        $addFields: {
          job: { $arrayElemAt: ["$job", 0] },
        },
      },
      {
        $project: project,
      },
      { $sort: sort },
    ];
    let cursor;
    try {
      cursor = await ProposalsDAO.#proposals.aggregate(pipeline);
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return {
        success: false,
        data: [],
        totalNumProposals: 0,
        statusCode: 404,
      };
    }
    const displayCursor = cursor
      .skip(parseInt(page) * parseInt(proposalsPerPage))
      .limit(parseInt(proposalsPerPage));

    try {
      const documents = await displayCursor.toArray();
      const totalNumProposals = documents.length;
      return {
        success: true,
        data: documents,
        totalNumProposals,
        statusCode: documents.length > 0 ? 200 : 404,
      };
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
      );
      throw e;
    }
  }
}

export default ProposalsDAO;
