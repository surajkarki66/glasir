import logger from "../configs/logger";
import config from "../configs/config";

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
}

export default SaveJobsDAO;
