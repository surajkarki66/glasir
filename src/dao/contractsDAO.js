import { ObjectId } from "mongodb";

import config from "../configs/config";
import logger from "../configs/logger";

class ContractsDAO {
  static #contracts;
  static #DEFAULT_PROJECTS = {
    "job.title": 1,
    "job.description": 1,
    workDetails: 1,
    contractTitle: 1,
    isActive: 1,
    isClosed: 1,
    createdAt: 1,
    updatedAt: 1,
  };
  static #DEFAULT_SORT = { createdAt: 1, updatedAt: 1 };

  static async injectDB(conn) {
    if (ContractsDAO.#contracts) {
      return;
    }
    try {
      ContractsDAO.#contracts = await conn
        .db(config.database)
        .collection("contracts");
      logger.info(
        `Connected to contracts collection of ${config.database} database.`,
        "ContractsDAO.injectDB()",
      );
    } catch (e) {
      logger.error(
        `Error while injecting DB: ${e.message}`,
        "ContractsDAO.injectDB()",
      );
      throw e;
    }
  }
  static async createContract(contractInfo) {
    try {
      const result = await ContractsDAO.#contracts.insertOne(contractInfo);
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
            error: "Contract is not created",
          },
          statusCode: 500,
        };
      }
    } catch (error) {
      logger.error(
        `Error occurred while adding new contract, ${error.message}.`,
      );
      throw error;
    }
  }
  static async getContractByFreelancerIdAndJobIdAndEmployerId(
    freelancerId,
    jobId,
    employerId,
  ) {
    return await ContractsDAO.#contracts.findOne({
      job: ObjectId(jobId),
      freelancer: ObjectId(freelancerId),
      employer: ObjectId(employerId),
    });
  }
  static async getContracts({ filter, page = 0, contractsPerPage = 20 } = {}) {
    let queryParams = {};
    if (filter) {
      queryParams = filter;
    }

    const {
      query = filter,
      project = ContractsDAO.#DEFAULT_PROJECTS,
      sort = ContractsDAO.#DEFAULT_SORT,
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
      cursor = await ContractsDAO.#contracts.aggregate(pipeline);
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return {
        success: false,
        data: [],
        totalNumContracts: 0,
        statusCode: 404,
      };
    }
    const displayCursor = cursor
      .skip(parseInt(page) * parseInt(contractsPerPage))
      .limit(parseInt(contractsPerPage));

    try {
      const documents = await displayCursor.toArray();
      const totalNumContracts = documents.length;
      return {
        success: true,
        data: documents,
        totalNumContracts,
        statusCode: documents.length > 0 ? 200 : 404,
      };
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
      );
      throw e;
    }
  }
  static async getContractById(id, forWhom) {
    try {
      let pipeline = [];
      if (forWhom === "freelancer") {
        pipeline = [
          { $match: { _id: ObjectId(id) } },
          {
            $lookup: {
              from: "employers",
              localField: "employer",
              foreignField: "_id",
              as: "employer",
            },
          },
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
              employer: { $arrayElemAt: ["$employer", 0] },
              job: { $arrayElemAt: ["$job", 0] },
            },
          },
          {
            $addFields: {
              "employer.rating": {
                averageScore: { $avg: "$employer.ratings.ratingScore" },
                rateCounts: { $size: "$employer.ratings" },
              },
            },
          },
          {
            $project: {
              "employer.ratings": 0,
              "employer.phone": 0,
            },
          },
        ];
      }
      if (forWhom === "employer") {
        pipeline = [
          { $match: { _id: ObjectId(id) } },
          {
            $lookup: {
              from: "freelancers",
              localField: "freelancer",
              foreignField: "_id",
              as: "freelancer",
            },
          },
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
              freelancer: { $arrayElemAt: ["$freelancer", 0] },
              job: { $arrayElemAt: ["$job", 0] },
            },
          },
          {
            $addFields: {
              "freelancer.rating": {
                averageScore: { $avg: "$freelancer.ratings.ratingScore" },
                rateCounts: { $size: "$freelancer.ratings" },
              },
            },
          },
          {
            $project: {
              "freelancer.ratings": 0,
              "freelancer.phone": 0,
            },
          },
        ];
      }

      const contract = await ContractsDAO.#contracts.aggregate(pipeline).next();
      if (contract) {
        return {
          success: true,
          data: contract,
          statusCode: 200,
        };
      } else {
        const message = "No document matching id: " + id + " could be found!";
        logger.error(message, "getContractById()");
        return {
          success: false,
          data: {},
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
        "getContractById()",
      );
      throw e;
    }
  }
  static async updateContract(contractId, updateObject) {
    try {
      const result = await ContractsDAO.#contracts.updateOne(
        {
          _id: ObjectId(contractId),
        },
        {
          $set: updateObject,
        },
      );
      if (
        (result.modifiedCount === 1 && result.matchedCount === 1) ||
        result.matchedCount === 1
      ) {
        return {
          success: true,
          data: {
            message: "Updated successfully.",
          },
          statusCode: 201,
        };
      } else {
        return {
          success: false,
          data: {
            error: "No contract exist with this id.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Error occurred while updating contract, ${e}`,
        "updateContract()",
      );
      throw e;
    }
  }
  static async getContractByContractId(contractId) {
    return await ContractsDAO.#contracts.findOne({ _id: ObjectId(contractId) });
  }
  static async deleteContractsByJobId(jobId) {
    return await ContractsDAO.#contracts.deleteMany({ job: ObjectId(jobId) });
  }
}

export default ContractsDAO;
