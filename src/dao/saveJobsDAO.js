import logger from "../configs/logger";
import config from "../configs/config";
import { ObjectId } from "mongodb";

class SaveJobsDAO {
  static #saveJobs;
  static #DEFAULT_SORT = { createdAt: -1, updatedAt: -1 };

  static async injectDB(conn) {
    if (SaveJobsDAO.#saveJobs) {
      return;
    }
    try {
      SaveJobsDAO.#saveJobs = await conn
        .db(config.database)
        .collection("saved_jobs");
      logger.info(
        `Connected to saved_jobs collection of ${config.database} database.`,
        "SaveJobsDAO.injectDB()",
      );
    } catch (e) {
      logger.error(
        `Error while injecting DB: ${e.message}`,
        "SaveJobsDAO.injectDB()",
      );
      throw e;
    }
  }
  static async createSaveJob(saveJobInfo) {
    try {
      const result = await SaveJobsDAO.#saveJobs.insertOne(saveJobInfo);
      if (result.insertedCount === 1) {
        const data = result.ops[0];
        return {
          success: true,
          data: data,
          statusCode: 201,
        };
      }
    } catch (e) {
      if (String(e).startsWith("MongoError: Document failed validation")) {
        return {
          success: false,
          data: { error: "Document failed validation" },
          statusCode: 422,
        };
      }
      logger.error(`Error occurred while adding new job, ${e}.`);
      throw e;
    }
  }
  static async getSaveJobByJobIdAndFreelancerId(freelancerId, jobId) {
    return await SaveJobsDAO.#saveJobs.findOne({
      jobId: ObjectId(jobId),
      freelancerId: ObjectId(freelancerId),
    });
  }
  static async deleteSaveJob(freelancerId, jobId) {
    try {
      const result = await SaveJobsDAO.#saveJobs.deleteOne({
        jobId: ObjectId(jobId),
        freelancerId: ObjectId(freelancerId),
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
            error: "Job doesn't exist.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Error occurred while deleting job, ${e}`,
        "deleteSaveJob()",
      );
      throw e;
    }
  }
  static async getJobs({ filter, page = 0, jobsPerPage = 20 } = {}) {
    let queryParams = {};
    if (filter) {
      queryParams = filter;
    }

    const {
      query = filter,
      project = {
        jobId: 0,
        "job.projectLengthInHours": 0,
        "job.category": 0,
        "job.hired": 0,
        "job.projectType": 0,
        "job.proposals": 0,
        "job.employer.ratings": 0,
        "job.employer.phone": 0,
        "job.employerId": 0,
        "job.employer.firstName": 0,
        "job.employer.lastName": 0,
        "job.employer.avatar": 0,
        "job.employer.isVerified": 0,
        "job.employer.totalMoneySpent": 0,
      },
      sort = SaveJobsDAO.#DEFAULT_SORT,
    } = queryParams;
    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
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
          localField: "job.employerId",
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
        $addFields: {
          "job.employer.rating": {
            averageScore: { $avg: "$job.employer.ratings.ratingScore" },
            rateCounts: { $size: "$job.employer.ratings" },
          },
        },
      },

      {
        $project: project,
      },
      { $sort: sort },
    ];
    let cursor;
    try {
      cursor = await SaveJobsDAO.#saveJobs.aggregate(pipeline);
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
  static async deleteSaveJobsByJobId(jobId) {
    return await SaveJobsDAO.#saveJobs.deleteMany({ jobId: ObjectId(jobId) });
  }
  static async deleteSaveJobsByFreelancerId(freelancerId) {
    return await SaveJobsDAO.#saveJobs.deleteMany({
      freelancerId: ObjectId(freelancerId),
    });
  }
}

export default SaveJobsDAO;
