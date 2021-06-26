import config from "../configs/config";
import logger from "../configs/logger";

class JobsDAO {
  static #jobs;
  static #DEFAULT_PROJECT = {};
  static #DEFAULT_SORT = { createdAt: -1 };
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
  static async getJobs({ filters = null, page = 0, jobsPerPage = 20 } = {}) {
    let queryParams = {};

    if (filters) {
      /** @TODO
       * Add here filter objects
       */
    }
    const {
      query = {},
      project = JobsDAO.#DEFAULT_PROJECT,
      sort = JobsDAO.#DEFAULT_SORT,
    } = queryParams;
    let cursor;
    try {
      cursor = await JobsDAO.#jobs.find(query).project(project).sort(sort);
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
      const totalNumJobs =
        parseInt(page) === 0 ? await JobsDAO.#jobs.countDocuments({}) : 0;
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
}

export default JobsDAO;
