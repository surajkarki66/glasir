import logger from "../utils/logger";

class FreelancersDAO {
  static #freelancers;

  static async injectDB(conn) {
    if (FreelancersDAO.#freelancers) {
      return;
    }
    try {
      FreelancersDAO.#freelancers = await conn
        .db(process.env.DB)
        .collection("freelancers");
      logger.info(
        `Connected to freelancers collection of ${process.env.DB} database.`,
        "FreelancersDAO.injectDB()"
      );
    } catch (e) {
      logger.error(
        `Error while injecting DB: ${e.message}`,
        "FreelancersDAO.injectDB()"
      );
      throw e;
    }
  }
  static async createProfile(profileInfo) {
    try {
    } catch (error) {
      logger.error(
        `Error occurred while adding new profile, ${error.message}.`
      );
      return { success: false, error: error.message, statusCode: 500 };
    }
  }
}

export default FreelancersDAO;
