import config from "../config/config";
import logger from "../config/logger";

class ClientsDAO {
  static clients;
  static async injectDB(conn) {
    if (ClientsDAO.clients) {
      return;
    }
    try {
      ClientsDAO.clients = await conn.db(config.database).collection("clients");
      logger.info(
        `Connected to clients collection of ${config.database} database.`,
        "ClientsDAO.injectDB()",
      );
    } catch (e) {
      logger.error(
        `Error while injecting DB: ${e.message}`,
        "ClientsDAO.injectDB()",
      );
      throw e;
    }
  }
}

export default ClientsDAO;
