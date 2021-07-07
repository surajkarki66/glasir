import { ObjectId } from "mongodb";

import config from "../configs/config";
import logger from "../configs/logger";

class FreelancersDAO {
  static freelancers;
  static DEFAULT_PROJECT = {
    firstName: 1,
    lastName: 1,
    expertise: 1,
    hourlyRate: 1,
    totalMoneyEarned: 1,
    title: 1,
    englishLanguage: 1,
    isVerified: 1,
    avatar: 1,
    jobsWorkedIn: 1,
  };
  static DEFAULT_SORT = { firstName: 1, lastName: 1 };

  static async injectDB(conn) {
    if (FreelancersDAO.freelancers) {
      return;
    }
    try {
      FreelancersDAO.freelancers = await conn
        .db(config.database)
        .collection("freelancers");
      logger.info(
        `Connected to freelancers collection of ${config.database} database.`,
        "FreelancersDAO.injectDB()",
      );
    } catch (e) {
      logger.error(
        `Error while injecting DB: ${e.message}`,
        "FreelancersDAO.injectDB()",
      );
      throw e;
    }
  }
  static async createFreelancer(freelancerInfo) {
    try {
      const result = await FreelancersDAO.freelancers.insertOne(freelancerInfo);
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
  static textSearchQuery(text) {
    const query = {
      text: {
        query: text,
        path: ["firstName", "lastName", "title"],
        fuzzy: {
          maxEdits: 2,
          prefixLength: 3,
        },
      },
    };
    return { query };
  }
  static serviceSearchQuery(service) {
    const query = {
      "expertise.service": service,
    };
    return query;
  }
  static expertiseLevelSearchQuery(expertiseLevel) {
    const query = {
      "expertise.expertiseLevel": expertiseLevel,
    };
    return query;
  }
  static provinceSearchQuery(province) {
    const query = {
      "location.province": province,
    };
    return query;
  }

  static englishProficiencySearchQuery(proficiency) {
    const query = { "englishLanguage.proficiency": proficiency };
    return query;
  }

  static async getFreelancers({
    filters = null,
    page = 0,
    freelancersPerPage = 20,
  } = {}) {
    let queryParams = {};

    if (filters) {
      if ("text" in filters) {
        const { query } = this.textSearchQuery(filters["text"]);
        queryParams = { searchText: { ...query }, sort };
      }
      if ("service" in filters) {
        const serviceQuery = this.serviceSearchQuery(filters["service"]);
        queryParams.query = { ...queryParams.query, ...serviceQuery };
      }
      if ("expertiseLevel" in filters) {
        const expertiseLevelQuery = this.expertiseLevelSearchQuery(
          filters["expertiseLevel"],
        );
        queryParams.query = {
          ...queryParams.query,
          ...expertiseLevelQuery,
        };
      }
      if ("province" in filters) {
        const provinceQuery = this.provinceSearchQuery(filters["province"]);
        queryParams.query = {
          ...queryParams.query,
          ...provinceQuery,
        };
      }
      if ("englishProficiency" in filters) {
        const proficiencyQuery = this.englishProficiencySearchQuery(
          filters["englishProficiency"],
        );
        queryParams.query = {
          ...queryParams.query,
          ...proficiencyQuery,
        };
      }
    }
    const {
      query = {},
      searchText = null,
      project = FreelancersDAO.DEFAULT_PROJECT,
      sort = FreelancersDAO.DEFAULT_SORT,
    } = queryParams;
    let pipeline = [
      { $match: query },
      {
        $project: {
          ...project,
          rating: {
            averageScore: { $avg: "$ratings.ratingScore" },
            rateCounts: { $size: "$ratings" },
          },
          "location.country": 1,
          "location.province": 1,
        },
      },

      { $sort: sort },
    ];
    if (searchText) {
      pipeline = [
        { $search: searchText },
        { $match: query },
        {
          $project: {
            ...project,
            rating: {
              averageScore: { $avg: "$ratings.ratingScore" },
              rateCounts: { $size: "$ratings" },
            },
            "location.country": 1,
            "location.province": 1,
            score: { $meta: "searchScore" },
          },
        },
      ];
    }

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
      return {
        success: true,
        data: freelancersList,
        totalNumFreelancers: freelancersList.length,
        statusCode: freelancersList.length > 0 ? 200 : 404,
      };
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
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
  static async getFreelancerById(id) {
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
          },
        },
      ];

      const freelancer = await FreelancersDAO.freelancers
        .aggregate(pipeline)
        .next();
      if (freelancer) {
        return {
          success: true,
          data: freelancer,
          statusCode: 200,
        };
      } else {
        const message = "No document matching id: " + id + " could be found!";
        logger.error(message, "getFreelancerById()");
        return {
          success: false,
          data: {},
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
        "getFreelancerById()",
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
        {
          $addFields: {
            user: { $arrayElemAt: ["$user", 0] },
            rating: {
              averageScore: { $avg: "$ratings.ratingScore" },
              rateCounts: { $size: "$ratings" },
            },
          },
        },
        { $project: { "user.password": 0, ratings: 0 } },
      ];
      const profile = await FreelancersDAO.freelancers
        .aggregate(pipeline)
        .next();
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

  static async updateFreelancer(freelancerId, updateObject) {
    try {
      const result = await FreelancersDAO.freelancers.updateOne(
        {
          _id: ObjectId(freelancerId),
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
            error: "No freelancer exist with this id.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Error occurred while updating employer, ${e}`,
        "updateFreelancer()",
      );
      throw e;
    }
  }
  static async addJobId(freelancerId, jobId) {
    try {
      /**
       * Push jobId to freelancer's profile
       * This is for freelancer to show how many jobs they already worked in past.
       */
      const result = await FreelancersDAO.freelancers.updateOne(
        {
          _id: ObjectId(freelancerId),
        },
        { $addToSet: { jobsWorkedIn: ObjectId(jobId) } },
      );
      if (
        (result.modifiedCount === 1 && result.matchedCount === 1) ||
        result.matchedCount === 1
      ) {
        return {
          success: true,
          data: {
            message: "jobId added successfully.",
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
        `Error occurred while adding job id, ${e}`,
        "updateFreelancer()",
      );
      throw e;
    }
  }
  static async addEmployment(freelancerId, employment) {
    try {
      const result = await FreelancersDAO.freelancers.updateOne(
        {
          _id: ObjectId(freelancerId),
        },
        {
          $push: {
            employments: employment,
          },
        },
        { safe: true, upsert: true },
      );
      if (result.modifiedCount === 1 && result.matchedCount === 1) {
        return {
          success: true,
          data: {
            message: "Employment added successfully.",
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
    } catch (error) {
      logger.error(
        `Error occurred while updating adding new employment, ${error}`,
        "addEmployment()",
      );
      throw error;
    }
  }

  static async updateEmployment(
    freelancerId,
    companyName,
    newEmployment = null,
  ) {
    try {
      const result = await FreelancersDAO.freelancers.updateOne(
        newEmployment
          ? {
              $and: [
                { _id: ObjectId(freelancerId) },
                { employments: { $elemMatch: { company: companyName } } },
              ],
            }
          : {
              _id: ObjectId(freelancerId),
            },
        newEmployment
          ? { $set: { "employments.$": newEmployment } }
          : {
              $pull: {
                employments: { company: companyName },
              },
            },
      );
      if (result.modifiedCount === 1 && result.matchedCount === 1) {
        return {
          success: true,
          data: {
            message: "Employment updated successfully.",
          },
          statusCode: 201,
        };
      } else {
        return {
          success: false,
          data: {
            error: "No Company exist with this name.",
          },
          statusCode: 404,
        };
      }
    } catch (error) {
      logger.error(
        `Error occurred while updating employment, ${error}`,
        "updateEmployment()",
      );
      throw error;
    }
  }
  static async deleteFreelancerByUserId(userId) {
    try {
      const result = await FreelancersDAO.freelancers.deleteOne({
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
            error: "No freelancer exist with this id.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Error occurred while deleting user, ${e}`,
        "deleteFreelancer()",
      );
      throw e;
    }
  }

  static async pushRate(freelancerId, rateObject) {
    try {
      const result = await FreelancersDAO.freelancers.updateOne(
        {
          _id: ObjectId(freelancerId),
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
            error: "Freelancer is already rated",
          },
          statusCode: 200,
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
      logger.error(`Error occurred while adding rating ${e}`, "pushRate()");
      throw e;
    }
  }

  static async isRated(employerId, freelancerId) {
    try {
      const pipeline = [
        {
          $match: {
            _id: ObjectId(freelancerId),
            "ratings.employer": ObjectId(employerId),
          },
        },
        {
          $project: {
            ratings: {
              $filter: {
                input: "$ratings",
                as: "rate",
                cond: {
                  $eq: ["$$rate.employer", ObjectId(employerId)],
                },
              },
            },
          },
        },
        { $addFields: { rating: { $arrayElemAt: ["$ratings", 0] } } },
        { $project: { rating: 1 } },
      ];
      const result = await FreelancersDAO.freelancers
        .aggregate(pipeline)
        .next();
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
      const result = await FreelancersDAO.freelancers.updateOne(
        {
          _id: ObjectId(freelancerId),
        },
        { $pull: { ratings: { employer: ObjectId(employerId) } } },
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
          data: { error: "No freelancer exist with this id." },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(`Error occurred while pulling rating ${e}`, "pullRate()");
      throw e;
    }
  }
}

export default FreelancersDAO;
