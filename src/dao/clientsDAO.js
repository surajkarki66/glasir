import logger from "../utils/logger";

class ClientsDAO {
  static clients;
  static async injectDB(conn) {
    if (ClientsDAO.clients) {
      return;
    }
    try {
      ClientsDAO.clients = await conn.db(process.env.DB).collection("clients");
      logger.info(
        `Connected to clients collection of ${process.env.DB} database.`,
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
