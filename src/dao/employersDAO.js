import { ObjectId } from "mongodb";

import config from "../configs/config";
import logger from "../configs/logger";

class EmployersDAO {
  static #employers;
  static #DEFAULT_SORT = [["firstName", -1]];
  static async injectDB(conn) {
    if (EmployersDAO.#employers) {
      return;
    }
    try {
      EmployersDAO.#employers = await conn
        .db(config.database)
        .collection("employers");
      logger.info(
        `Connected to employers collection of ${config.database} database.`,
        "EmployersDAO.injectDB()",
      );
    } catch (e) {
      logger.error(
        `Error while injecting DB: ${e.message}`,
        "EmployersDAO.injectDB()",
      );
      throw e;
    }
  }
  static async createEmployer(employerInfo) {
    try {
      const result = await EmployersDAO.#employers.insertOne(employerInfo);
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
            error: "A employer with the given user id or phone already exists.",
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
  static async getEmployers({
    page = 0,
    employersPerPage = 10,
    filter = {},
  } = {}) {
    const sort = EmployersDAO.#DEFAULT_SORT;
    const projection = {};
    let cursor;
    try {
      cursor = await EmployersDAO.#employers
        .find(filter)
        .project(projection)
        .sort(sort);
    } catch (e) {
      logger.error(`Unable to issue find command, ${e.message}`);
      return {
        success: false,
        data: [],
        totalNumEmployers: 0,
        statusCode: 404,
      };
    }
    const displayCursor = cursor
      .skip(parseInt(page) * parseInt(employersPerPage))
      .limit(parseInt(employersPerPage));
    try {
      const documents = await displayCursor.toArray();
      const totalNumEmployers =
        parseInt(page) === 0
          ? await EmployersDAO.#employers.countDocuments({})
          : 0;
      return {
        success: true,
        data: documents,
        totalNumEmployers,
        statusCode: documents.length > 0 ? 200 : 404,
      };
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
      );
      throw e;
    }
  }
  static async getEmployerByPhone(phoneNumber) {
    return await EmployersDAO.#employers.findOne({
      "phone.phoneNumber": phoneNumber,
    });
  }
  static async getEmployerByUserId(userId) {
    return await EmployersDAO.#employers.findOne({
      user: ObjectId(userId),
    });
  }
  static async getEmployerById(id) {
    try {
      const pipeline = [
        { $match: { _id: ObjectId(id) } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
        {
          $project: {
            "user.password": 0,
            "user.role": 0,
          },
        },
      ];

      const employer = await EmployersDAO.#employers.aggregate(pipeline).next();
      if (employer) {
        return {
          success: true,
          data: employer,
          statusCode: 200,
        };
      } else {
        const message = "No document matching id: " + id + " could be found!";
        logger.error(message, "getEmployerById()");
        return {
          success: false,
          data: {},
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
        "getEmployerById()",
      );
      throw e;
    }
  }
  static async me(userId) {
    try {
      const pipeline = [
        {
          $match: {
            user: ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $addFields: { user: { $arrayElemAt: ["$user", 0] } } },
        { $project: { "user.password": 0 } },
      ];
      const profile = await EmployersDAO.#employers.aggregate(pipeline).next();
      let profileObj;

      if (profile) {
        profileObj = { success: true, data: profile, statusCode: 200 };
        return profileObj;
      }
      profileObj = { success: false, data: {}, statusCode: 404 };
      return profileObj;
    } catch (e) {
      logger.error(`Something went wrong: ${e}`);
      throw e;
    }
  }
  static async updateEmployer(EmployerId, updateObject) {
    try {
      const result = await EmployersDAO.#employers.updateOne(
        {
          _id: ObjectId(EmployerId),
        },
        {
          $set: updateObject,
        },
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
            error: "No employer exist with this id.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Error occurred while updating employer, ${e}`,
        "updateEmployer()",
      );
      throw e;
    }
  }
  static async deleteEmployerByUserId(userId) {
    try {
      const result = await EmployersDAO.#employers.deleteOne({
        user: ObjectId(userId),
      });
      if (result.deletedCount === 1) {
        return {
          success: true,
          data: { message: "Deleted successfully." },
          statusCode: 200,
        };
      } else {
        return {
          success: false,
          data: {
            error: "No employer exist with this id.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Error occurred while deleting user, ${e}`,
        "deleteEmployer()",
      );
      throw e;
    }
  }

  static async pushRate(employerId, rateObject) {
    try {
      const result = await EmployersDAO.#employers.updateOne(
        {
          _id: ObjectId(employerId),
        },
        { $addToSet: { ratings: rateObject } },
      );
      if (result.modifiedCount === 1 && result.matchedCount === 1) {
        return {
          success: true,
          data: {
            message: "Rating added successfully.",
          },
          statusCode: 201,
        };
      } else if (result.matchedCount === 1 && result.modifiedCount === 0) {
        return {
          success: false,
          data: {
            error: "Employer is already rated",
          },
          statusCode: 200,
        };
      } else {
        return {
          success: false,
          data: {
            error: "No employer exist with this id.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(`Error occurred while adding rating ${e}`, "pushRate()");
      throw e;
    }
  }
}

export default EmployersDAO;
