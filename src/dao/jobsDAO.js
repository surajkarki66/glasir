import { ObjectId } from "mongodb";

import config from "../configs/config";
import logger from "../configs/logger";

class JobsDAO {
  static #jobs;
  static #DEFAULT_PROJECT = {
    title: 1,
    description: 1,
    "employer.location.country": 1,
    "employer.totalMoneySpent": 1,
    "employer.payment.isVerified": 1,
    "employer.rating": 1,
    jobStatus: 1,
    projectLengthInHours: 1,
    moneySpent: 1,
    isPaymentVerified: 1,
    category: 1,
    expertise: 1,
    pay: 1,
    proposals: 1,
    createdAt: 1,
    updatedAt: 1,
  };
  static #DEFAULT_SORT = { createdAt: -1, updatedAt: -1 };
  static async injectDB(conn) {
    if (JobsDAO.#jobs) {
      return;
    }
    try {
      JobsDAO.#jobs = await conn.db(config.database).collection("jobs");
      logger.info(
        `Connected to jobs collection of ${config.database} database.`,
        "JobsDAO.injectDB()",
      );
    } catch (e) {
      logger.error(
        `Error while injecting DB: ${e.message}`,
        "JobsDAO.injectDB()",
      );
      throw e;
    }
  }
  static async createJob(jobInfo) {
    try {
      const result = await JobsDAO.#jobs.insertOne(jobInfo);
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
            error: "Job is not created",
          },
          statusCode: 500,
        };
      }
    } catch (error) {
      logger.error(`Error occurred while adding new job, ${error.message}.`);
      throw error;
    }
  }
  static textSearchQuery(text) {
    const query = {
      text: {
        query: text,
        path: ["title", "description"],
        score: { boost: { value: 5 } },
      },
      highlight: {
        path: ["title", "description"],
      },
    };
    const project = {
      ...JobsDAO.#DEFAULT_PROJECT,
      score: { $meta: "searchScore" },
      highlight: { $meta: "searchHighlights" },
    };
    return { query, project };
  }
  static categorySearchQuery(category) {
    const query = {
      category: category,
    };
    return query;
  }
  static expertiseLevelSearchQuery(expertiseLevel) {
    const query = {
      "expertise.expertiseLevel": expertiseLevel,
    };
    return query;
  }
  static projectTypeSearchQuery(projectType) {
    const query = {
      projectType: projectType,
    };
    return query;
  }
  static payTypeSearchQuery(payType) {
    const query = {
      "pay.type": payType,
    };
    return query;
  }
  static async getJobs({ filters = null, page = 1, jobsPerPage = 20 } = {}) {
    let queryParams = {};

    if (filters) {
      if ("text" in filters) {
        const { query, project } = this.textSearchQuery(filters["text"]);
        queryParams = { searchText: { ...query }, project };
      }
      if ("category" in filters) {
        const categoryQuery = this.categorySearchQuery(filters["category"]);
        queryParams.query = { ...queryParams.query, ...categoryQuery };
      }
      if ("expertiseLevel" in filters) {
        const expertiseLevelQuery = this.expertiseLevelSearchQuery(
          filters["expertiseLevel"],
        );
        queryParams.query = {
          ...queryParams.query,
          ...expertiseLevelQuery,
        };
      }
      if ("projectType" in filters) {
        const projectTypeQuery = this.projectTypeSearchQuery(
          filters["projectType"],
        );
        queryParams.query = {
          ...queryParams.query,
          ...projectTypeQuery,
        };
      }
      if ("payType" in filters) {
        const payType = this.payTypeSearchQuery(filters["payType"]);
        queryParams.query = {
          ...queryParams.query,
          ...payType,
        };
      }
    }
    const {
      query = {},
      searchText = null,
      project = JobsDAO.#DEFAULT_PROJECT,
      sort = JobsDAO.#DEFAULT_SORT,
    } = queryParams;
    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "employers",
          localField: "employerId",
          foreignField: "_id",
          as: "employer",
        },
      },
      {
        $addFields: {
          employer: { $arrayElemAt: ["$employer", 0] },
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
        $project: project,
      },
      { $sort: sort },
    ];
    if (searchText) {
      pipeline = [
        { $search: searchText },
        { $match: query },
        {
          $lookup: {
            from: "employers",
            localField: "employerId",
            foreignField: "_id",
            as: "employer",
          },
        },
        {
          $addFields: {
            employer: { $arrayElemAt: ["$employer", 0] },
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
          $project: project,
        },
        { $sort: sort },
      ];
    }
    let cursor;
    let totalJobsCount;
    try {
      cursor = await JobsDAO.#jobs.aggregate(pipeline);
      const jobs = await cursor.toArray();
      totalJobsCount = jobs.length;
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return {
        success: false,
        data: [],
        totalJobsCount: 0,
        totalJobsCountInPage: 0,
        statusCode: 404,
      };
    }
    const displayCursor = cursor
      .skip(parseInt(page - 1) * parseInt(jobsPerPage))
      .limit(parseInt(jobsPerPage));

    try {
      const documents = await displayCursor.toArray();
      const totalJobsCountInPage = documents.length;
      return {
        success: true,
        data: documents,
        totalJobsCount,
        totalJobsCountInPage,
        statusCode: documents.length > 0 ? 200 : 404,
      };
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
      );
      throw e;
    }
  }
  static async getEmployerJobs({ filter, page = 0, jobsPerPage = 20 } = {}) {
    const sort = JobsDAO.#DEFAULT_SORT;
    const projection = {
      title: 1,
      pay: 1,
      proposals: 1,
      hired: 1,
      jobStatus: 1,
      createdAt: 1,
      updatedAt: 1,
    };
    let cursor;
    try {
      cursor = await JobsDAO.#jobs.find(filter).project(projection).sort(sort);
    } catch (e) {
      logger.error(`Unable to issue find command, ${e.message}`);
      return {
        success: false,
        data: [],
        totalNumJobs: 0,
        statusCode: 404,
      };
    }
    const displayCursor = cursor
      .skip(parseInt(page) * parseInt(jobsPerPage))
      .limit(parseInt(jobsPerPage));
    try {
      const documents = await displayCursor.toArray();
      const totalNumJobs = documents.length;
      return {
        success: true,
        data: documents,
        totalNumJobs,
        statusCode: documents.length > 0 ? 200 : 404,
      };
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
      );
      throw e;
    }
  }
  static async getJobById(id) {
    try {
      const pipeline = [
        { $match: { _id: ObjectId(id) } },
        {
          $lookup: {
            from: "employers",
            localField: "employerId",
            foreignField: "_id",
            as: "employer",
          },
        },
        {
          $addFields: {
            employer: { $arrayElemAt: ["$employer", 0] },
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
            employerId: 0,
          },
        },
      ];

      const job = await JobsDAO.#jobs.aggregate(pipeline).next();
      if (job) {
        return {
          success: true,
          data: job,
          statusCode: 200,
        };
      } else {
        const message = "No document matching id: " + id + " could be found!";
        logger.error(message, "getJobById()");
        return {
          success: false,
          data: {},
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
        "getJobById()",
      );
      throw e;
    }
  }
  static async updateJob(jobId, updateObject) {
    try {
      const result = await JobsDAO.#jobs.updateOne(
        {
          _id: ObjectId(jobId),
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
            error: "No job exist with this id.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(`Error occurred while updating job, ${e}`, "updateJob()");
      throw e;
    }
  }
  static async deleteJobById(jobId) {
    try {
      const result = await JobsDAO.#jobs.deleteOne({
        _id: ObjectId(jobId),
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
            error: "No job exist with this id.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Error occurred while deleting job, ${e}`,
        "deleteJobById()",
      );
      throw e;
    }
  }
  static async addProposalId(proposalId, jobId) {
    try {
      const result = await JobsDAO.#jobs.updateOne(
        {
          _id: ObjectId(jobId),
        },
        { $addToSet: { proposals: ObjectId(proposalId) } },
      );
      if (
        (result.modifiedCount === 1 && result.matchedCount === 1) ||
        result.matchedCount === 1
      ) {
        return {
          success: true,
          data: {
            message: "proposalId added successfully.",
          },
          statusCode: 201,
        };
      } else {
        return {
          success: false,
          data: {
            error: "No job exist with this id.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Error occurred while adding proposal id, ${e}`,
        "addProposalId()",
      );
      throw e;
    }
  }
  static async removeProposalId(proposalId, jobId) {
    try {
      const result = await JobsDAO.#jobs.updateOne(
        {
          _id: ObjectId(jobId),
        },
        { $pull: { proposals: ObjectId(proposalId) } },
      );
      if (
        (result.modifiedCount === 1 && result.matchedCount === 1) ||
        result.matchedCount === 1
      ) {
        return {
          success: true,
          data: {
            message: "proposalId removed successfully.",
          },
          statusCode: 201,
        };
      } else {
        return {
          success: false,
          data: {
            error: "No job exist with this id.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Error occurred while removing proposal id, ${e}`,
        "removeProposalId()",
      );
      throw e;
    }
  }
  static async addFreelancerId(freelancerId, jobId) {
    try {
      const result = await JobsDAO.#jobs.updateOne(
        {
          _id: ObjectId(jobId),
        },
        { $addToSet: { hired: ObjectId(freelancerId) } },
      );
      if (
        (result.modifiedCount === 1 && result.matchedCount === 1) ||
        result.matchedCount === 1
      ) {
        return {
          success: true,
          data: {
            message: "freelancerId added successfully.",
          },
          statusCode: 201,
        };
      } else {
        return {
          success: false,
          data: {
            error: "No job exist with this id.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Error occurred while adding freelancer id, ${e}`,
        "addFreelancerId()",
      );
      throw e;
    }
  }

  static async removeFreelancerId(freelancerId, jobId) {
    try {
      const result = await JobsDAO.#jobs.updateOne(
        {
          _id: ObjectId(jobId),
        },
        { $pull: { hired: ObjectId(freelancerId) } },
      );
      if (
        (result.modifiedCount === 1 && result.matchedCount === 1) ||
        result.matchedCount === 1
      ) {
        return {
          success: true,
          data: {
            message: "freelancerId removed successfully.",
          },
          statusCode: 201,
        };
      } else {
        return {
          success: false,
          data: {
            error: "No job exist with this id.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Error occurred while removing freelancer id, ${e}`,
        "removeFreelancerId()",
      );
      throw e;
    }
  }

  static async isHired(jobId, freelancerId) {
    return await JobsDAO.#jobs.findOne({
      _id: ObjectId(jobId),
      hired: { $in: [ObjectId(freelancerId)] },
    });
  }
  static async deleteJobsByEmployerId(employerId) {
    return await JobsDAO.#jobs.deleteMany({ employerId: ObjectId(employerId) });
  }
}

export default JobsDAO;
