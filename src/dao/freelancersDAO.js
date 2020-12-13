import { ObjectId } from "bson";

import logger from "../utils/logger";
import { escapeRegex } from "../utils/utils";

class FreelancersDAO {
	static freelancers;
	static DEFAULT_PROJECT = {
		expertise: 1,
		hourlyRate: 1,
		title: 1,
		englishLanguage: 1,
		isVerified: 1,
	};
	static DEFAULT_SORT = { "user.fullName": 1 };

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
			$or: [
				{ "user.fullName": { $regex: new RegExp(escapeRegex(text), "gi") } },
				{ "user.username": { $regex: new RegExp(escapeRegex(text), "gi") } },
			],
		};
		// TODO: Sort By Job Success Rate
		const sort = { _id: 1 };
		return { query, sort };
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
				const { query, sort } = this.textSearchQuery(filters["text"]);
				queryParams = { query: { ...query }, sort };
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
			project = FreelancersDAO.DEFAULT_PROJECT,
			sort = FreelancersDAO.DEFAULT_SORT,
		} = queryParams;

		const pipeline = [
			{ $match: { isVerified: true } },
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
					...project,
					"user.fullName": {
						$concat: ["$user.firstName", " ", "$user.lastName"],
					},
					"location.province": 1,
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
				{ $addFields: { user: { $arrayElemAt: ["$user", 0] } } },
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

	static async getFreelancerByUserId(userId) {
		try {
			const query = {
				user: ObjectId(userId),
			};
			const freelancer = await FreelancersDAO.freelancers.findOne(query);
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
					data: {},
					statusCode: 404,
				};
			}
		} catch (e) {
			logger.error(
				`Unable to convert cursor to array or problem counting documents, ${e.message}`,
				"getFreelancerByUserId",
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
			if (
				e
					.toString()
					.startsWith(
						"Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters",
					)
			) {
				return null;
			}

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
				`Error occurred while updating user, ${e}`,
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
				{ $push: { employments: employment } },
			);
			console.log(result);
		} catch (error) {
			logger.error(
				`Error occurred while updating adding new employment, ${e}`,
				"addEmployment()",
			);
			throw e;
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
}

export default FreelancersDAO;
