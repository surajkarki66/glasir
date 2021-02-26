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
  static async createClient(clientInfo) {
    try {
      const info = {
        user: ObjectId(clientInfo.user),
        ...clientInfo,
      };
      const result = await ClientsDAO.clients.insertOne(info);
      if (result && result.insertedCount === 1) {
        const data = result.ops[0];
        return {
          success: true,
          data: data,
          statusCode: 201,
        };
      }
    } catch (error) {
      if (String(error).startsWith("MongoError: E11000 duplicate key error")) {
        logger.error(
          `Error occurred while adding new profile, ${error.message}.`,
        );
        return {
          success: false,
          data: {
            error:
              "A freelancer with the given user id or phone already exists.",
          },
          statusCode: 409,
        };
      }
      logger.error(
        `Error occurred while adding new profile, ${error.message}.`,
      );
      throw error;
    }
  }
}

export default ClientsDAO;
