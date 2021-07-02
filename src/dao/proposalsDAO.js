import logger from "../configs/logger";
import config from "../configs/config";

class ProposalsDAO {
  static #proposals;

  static async injectDB(conn) {
    if (ProposalsDAO.#proposals) {
      return;
    }
    try {
      ProposalsDAO.#proposals = await conn
        .db(config.database)
        .collection("proposals");
      logger.info(
        `Connected to proposals collection of ${config.database} database.`,
        "ProposalsDAO.injectDB()",
      );
    } catch (e) {
      logger.error(
        `Error while injecting DB: ${e.message}`,
        "ProposalsDAO.injectDB()",
      );
      throw e;
    }
  }
}

export default ProposalsDAO;
