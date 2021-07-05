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
  static async getProposalById(id) {
    try {
      const pipeline = [
        { $match: { _id: ObjectId(id) } },
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
          $lookup: {
            from: "employers",
            localField: "job.employer",
            foreignField: "_id",
            as: "job.employer",
          },
        },
        {
          $addFields: {
            "job.employer": { $arrayElemAt: ["$job.employer", 0] },
          },
        },

        {
          $project: {
            "job.proposals": 0,
            "job.employer.avatar": 0,
            "job.employer.company.website": 0,
            "job.employer.company.tagline": 0,
            "job.employer.company.phone": 0,
            "job.employer.location.zip": 0,
            "job.employer.user": 0,
            "job.employer.isVerified": 0,
            "job.employer.createdAt": 0,
            "job.employer.updatedAt": 0,
          },
        },
      ];

      const proposal = await ProposalsDAO.#proposals.aggregate(pipeline).next();
      if (proposal) {
        return {
          success: true,
          data: proposal,
          statusCode: 200,
        };
      } else {
        const message = "No document matching id: " + id + " could be found!";
        logger.error(message, "getProposalById()");
        return {
          success: false,
          data: {},
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
        "getProposalById()",
      );
      throw e;
    }
  }
  static async getProposalByProposalId(proposalId) {
    return await ProposalsDAO.#proposals.findOne({ _id: ObjectId(proposalId) });
  }
  static async deleteProposalById(proposalId) {
    try {
      const result = await ProposalsDAO.#proposals.deleteOne({
        _id: ObjectId(proposalId),
      });

      if (result.deletedCount === 1) {
        return {
          success: true,
          data: { message: "Deleted successfully." },
          statusCode: 200,
        };
      } else {
        return {
          success: false,
          data: {
            error: "No proposal exist with this id.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Error occurred while deleting proposal, ${e}`,
        "deleteProposalById()",
      );
      throw e;
    }
  }
  static async getProposalByJobId({
    filter,
    page = 0,
    proposalsPerPage = 20,
  } = {}) {
    const query = filter;
    const project = {
      coverLetter: 1,
      "freelancer.firstName": 1,
      "freelancer.lastName": 1,
      "freelancer.title": 1,
      "freelancer.location": 1,
      "freelancer.hourlyRate": 1,
      "freelancer.totalMoneyEarned": 1,
    };
    const sort = { createdAt: -1, updatedAt: -1 };
    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "freelancers",
          localField: "freelancer",
          foreignField: "_id",
          as: "freelancer",
        },
      },
      {
        $addFields: {
          freelancer: { $arrayElemAt: ["$freelancer", 0] },
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
