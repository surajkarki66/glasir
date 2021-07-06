import config from "../configs/config";
import logger from "../configs/logger";

class HiresDAO {
  static #hires;

  static async injectDB(conn) {
    if (HiresDAO.#hires) {
      return;
    }
    try {
      HiresDAO.#hires = await conn.db(config.database).collection("hires");
      logger.info(
        `Connected to hires collection of ${config.database} database.`,
        "HiresDAO.injectDB()",
      );
    } catch (e) {
      logger.error(
        `Error while injecting DB: ${e.message}`,
        "HiresDAO.injectDB()",
      );
      throw e;
    }
  }
}

export default HiresDAO;
