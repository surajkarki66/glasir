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
  static async getJobs({ filters = null, page = 0, jobsPerPage = 20 } = {}) {
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
          localField: "employer",
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
            localField: "employer",
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
          $project: project,
        },
      ];
    }
    let cursor;
    try {
      cursor = await JobsDAO.#jobs.aggregate(pipeline);
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
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
            localField: "employer",
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
          $project: {
            "employer.phone": 0,
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
}

export default JobsDAO;
