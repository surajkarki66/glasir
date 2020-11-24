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
      if (String(error).startsWith("MongoError: Document failed validation")) {
        return {
          success: false,
          data: { error: "Document failed validation" },
          statusCode: 422,
        };
      }
      if (String(error).startsWith("MongoError: E11000 duplicate key error")) {
        logger.error(
          `Error occurred while adding new profile, ${error.message}.`
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
        `Error occurred while adding new profile, ${error.message}.`
      );
      throw error;
    }
  }
  static async getFreelancerByPhone(phoneNumber) {
    return await FreelancersDAO.#freelancers.findOne({
      "phone.phoneNumber": phoneNumber,
    });
  }
  static async updateFreelancer(id, updateObject) {
    try {
      const result = await FreelancersDAO.#freelancers.updateOne(
        {
          _id: ObjectId(id),
        },
        {
          $set: updateObject,
        }
      );
      if (
        (result.modifiedCount === 1 && result.matchedCount === 1) ||
        result.matchedCount === 1
      ) {
        return {
          success: true,
          data: {
            message: "Updated successfully.",
          },
          statusCode: 201,
        };
      } else {
        return {
          success: false,
          data: {
            error: "No freelancer exist with this id.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Error occurred while updating user, ${e}`,
        "updateFreelancer()"
      );
      throw e;
    }
  }
}

export default FreelancersDAO;
