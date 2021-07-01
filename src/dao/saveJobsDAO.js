import logger from "../configs/logger";
import config from "../configs/config";
import { ObjectId } from "mongodb";

class SaveJobsDAO {
  static #saveJobs;

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
  static async getSaveJobByJobIdAndUserId(userId, jobId) {
    return await SaveJobsDAO.#saveJobs.findOne({
      job: ObjectId(jobId),
      user: ObjectId(userId),
    });
  }
  static async deleteSaveJob(userId, jobId) {
    try {
      const result = await SaveJobsDAO.#saveJobs.deleteOne({
        job: ObjectId(jobId),
        user: ObjectId(userId),
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
}

export default SaveJobsDAO;
