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
      userId: ObjectId(userId),
    });
  }
  static async getEmployerById(id) {
    try {
      const pipeline = [
        { $match: { _id: ObjectId(id) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ["$user", 0] },
            rating: {
              averageScore: { $avg: "$ratings.ratingScore" },
              rateCounts: { $size: "$ratings" },
            },
          },
        },
        {
          $project: {
            ratings: 0,
            "user.password": 0,
            "user.role": 0,
            userId: 0,
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
            userId: ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ["$user", 0] },
            rating: {
              averageScore: { $avg: "$ratings.ratingScore" },
              rateCounts: { $size: "$ratings" },
            },
          },
        },
        {
          $project: {
            ratings: 0,
            "user.password": 0,
            userId: 0,
          },
        },
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
        userId: ObjectId(userId),
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

  static async isRated(employerId, freelancerId) {
    try {
      const pipeline = [
        {
          $match: {
            _id: ObjectId(employerId),
            "ratings.freelancerId": ObjectId(freelancerId),
          },
        },
        {
          $project: {
            ratings: {
              $filter: {
                input: "$ratings",
                as: "rate",
                cond: {
                  $eq: ["$$rate.freelancerId", ObjectId(freelancerId)],
                },
              },
            },
          },
        },
        { $addFields: { rating: { $arrayElemAt: ["$ratings", 0] } } },
        { $project: { rating: 1 } },
      ];
      const result = await EmployersDAO.#employers.aggregate(pipeline).next();
      if (result) {
        return { success: true, data: result, statusCode: 200 };
      } else {
        return { success: false, data: result, statusCode: 404 };
      }
    } catch (e) {
      logger.error(`Error occurred while checking rating ${e}`, "isRated()");
      throw e;
    }
  }
  static async pullRate(employerId, freelancerId) {
    try {
      const result = await EmployersDAO.#employers.updateOne(
        {
          _id: ObjectId(employerId),
        },
        { $pull: { ratings: { freelancerId: ObjectId(freelancerId) } } },
      );
      if (result.modifiedCount === 1 && result.matchedCount === 1) {
        return {
          success: true,
          data: { message: "Pulled rate successfully" },
          statusCode: 201,
        };
      }
      if (result.matchedCount === 1 && result.modifiedCount === 0) {
        return {
          success: false,
          data: { error: "Already unrated" },
          statusCode: 404,
        };
      } else {
        return {
          success: false,
          data: { error: "No employer exist with this id." },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(`Error occurred while pulling rating ${e}`, "pullRate()");
      throw e;
    }
  }
  static async incrementMoneySpent(employerId, amount) {
    try {
      const result = await EmployersDAO.#employers.updateOne(
        {
          _id: ObjectId(employerId),
        },
        {
          $inc: {
            "totalMoneySpent.amount": amount,
          },
        },
      );
      if (result.modifiedCount === 1 && result.matchedCount === 1) {
        return {
          success: true,
          data: { message: "Incremented successfully" },
          statusCode: 201,
        };
      } else {
        return {
          success: false,
          data: { error: "No employer exist with this id." },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Error occurred while increasing money spent ${e}`,
        "incrementMoneySpent()",
      );
      throw e;
    }
  }
}

export default EmployersDAO;
