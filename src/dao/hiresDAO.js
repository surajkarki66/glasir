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
  static async createHire(hireInfo) {
    try {
      const result = await HiresDAO.#hires.insertOne(hireInfo);
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
            error: "Hire is not created",
          },
          statusCode: 500,
        };
      }
    } catch (error) {
      logger.error(`Error occurred while adding new hire, ${error.message}.`);
      throw error;
    }
  }
}

export default HiresDAO;
