import { ObjectId } from "mongodb";

import config from "../configs/config";
import logger from "../configs/logger";

class JobsDAO {
  static #jobs;
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
}

export default JobsDAO;
