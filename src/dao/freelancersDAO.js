import { ObjectId } from "bson";

import logger from "../utils/logger";

class FreelancersDAO {
  static freelancers;
  static DEFAULT_PROJECT = {
    expertise: 1,
    hourlyRate: 1,
    title: 1,
  };

  static DEFAULT_SORT = {
    "user.username": 1,
  };

  static async injectDB(conn) {
    if (FreelancersDAO.freelancers) {
      return;
    }
    try {
      FreelancersDAO.freelancers = await conn
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
      const result = await FreelancersDAO.freelancers.insertOne(info);
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
  static textSearchQuery(text) {
    const query = {
      $or: [{ "user.fullName": text }, { "user.username": text }],
    };
    const sort = FreelancersDAO.DEFAULT_SORT;
    const project = FreelancersDAO.DEFAULT_PROJECT;
    return { query, project, sort };
  }

  static async getFreelancers({
    filters = null,
    page = 0,
    freelancersPerPage = 20,
  } = {}) {
    let queryParams = {};
    if (filters) {
      if ("text" in filters) {
        queryParams = this.textSearchQuery(filters["text"]);
      }
    }
    const {
      query = {},
      project = FreelancersDAO.DEFAULT_PROJECT,
      sort = FreelancersDAO.DEFAULT_SORT,
    } = queryParams;

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $project: { ...project, user: { $arrayElemAt: ["$user", 0] } } },
      {
        $project: {
          ...project,
          "user.fullName": {
            $concat: ["$user.firstName", " ", "$user.lastName"],
          },
          // "user.firstName": 1,
          // "user.lastName": 1,
          "user.username": 1,
          "user.avatar": 1,
          "user.role": 1,
        },
      },
      { $match: query },
      { $sort: sort },
    ];

    let cursor;
    try {
      cursor = await FreelancersDAO.freelancers.aggregate(pipeline);
    } catch (e) {
      logger.error(`Unable to issue find command, ${e}`);
      return {
        success: false,
        data: [],
        totalNumFreelancers: 0,
        statusCode: 404,
      };
    }

    const displayCursor = cursor
      .skip(parseInt(page) * parseInt(freelancersPerPage))
      .limit(parseInt(freelancersPerPage));
    try {
      const freelancersList = await displayCursor.toArray();
      const totalNumFreelancers =
        parseInt(page) === 0
          ? await FreelancersDAO.freelancers.countDocuments(query)
          : 0;
      return {
        success: true,
        data: freelancersList,
        totalNumFreelancers,
        statusCode: freelancersList.length > 0 ? 200 : 404,
      };
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`
      );
      throw e;
    }
  }
  static async getFreelancerByPhone(phoneNumber) {
    return await FreelancersDAO.freelancers.findOne({
      "phone.phoneNumber": phoneNumber,
    });
  }
  static async getFreelancerByUserId(userId) {
    return await FreelancersDAO.freelancers.findOne({
      user: ObjectId(userId),
    });
  }
  static async updateFreelancer(id, updateObject) {
    try {
      const result = await FreelancersDAO.freelancers.updateOne(
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
