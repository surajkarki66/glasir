import { ObjectId } from "bson";

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
      const info = {
        user: ObjectId(profileInfo.user),
        ...profileInfo,
      };
      const result = await FreelancersDAO.#freelancers.insertOne(info);
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
          `Error occurred while adding new profile, ${error.message}.`
        );
        return {
          success: false,
          error: "A freelancer with the given user id or phone already exists.",
          statusCode: 409,
        };
      }
      logger.error(
        `Error occurred while adding new profile, ${error.message}.`
      );
      return { success: false, error: error.message, statusCode: 500 };
    }
  }
  static async getFreelancerByUserId(userId) {
    try {
      const query = {
        user: ObjectId(userId),
      };
      const freelancer = await FreelancersDAO.#freelancers.findOne(query);
      if (freelancer) {
        return {
          success: true,
          data: freelancer,
          statusCode: 200,
        };
      } else {
        const message = "No document matching id: " + id + " could be found!";
        logger.error(message, "getFreelancerByUserId()");
        return {
          success: false,
          data: [],
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
        "getFreelancerByUserId"
      );
      throw e;
    }
  }
}

export default FreelancersDAO;
