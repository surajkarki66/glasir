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
}

export default JobsDAO;
