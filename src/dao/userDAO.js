import {
	ObjectId
} from "mongodb";

import logger from "../utils/logger";

class UsersDAO {
	static #users;
	static #DEFAULT_SORT = [
		["username", -1]
	];

	static async injectDB(conn) {
		if (UsersDAO.#users) {
			return;
		}
		try {
			UsersDAO.#users = await conn.db(process.env.DB).collection("users");
			logger.info(
				`Connected to users collection of ${process.env.DB} database.`,
				"UsersDAO.injectDB()"
			);
		} catch (e) {
			logger.error(
				`Error while injecting DB: ${e.message}`,
				"UsersDAO.injectDB()"
			);
			throw e;
		}
	}
	static async createUser(userInfo) {
		try {
			const {
				email,
				firstName,
				lastName,
				username,
				password,
				role,
				isActive,
			} = userInfo;
			const result = await UsersDAO.#users.insertOne({
				email: email,
				firstName: firstName,
				lastName: lastName,
				username: username,
				password: password,
				role: role,
				isActive: isActive,
				joined_date: new Date()

			});
			const data = result.ops[0];

			return {
				data: data,
				statusCode: 201
			};
		} catch (e) {
			logger.error(
				"Error occurred while adding new user: " + e.message,
				"createUser()"
			);
			throw e;
		}
	}
	static async getUsers({
		page = 0,
		usersPerPage = 10
	} = {}) {
		const sort = UsersDAO.#DEFAULT_SORT;
		let cursor;
		try {
			cursor = await UsersDAO.#users.find({}).project({}).sort(sort);
		} catch (e) {
			logger.error(`Unable to issue find command, ${e.message}`);
			return {
				data: [],
				totalNumUsers: 0,
				statusCode: 404,
			};
		}
		const displayCursor = cursor
			.skip(parseInt(page) * parseInt(usersPerPage))
			.limit(parseInt(usersPerPage));
		try {
			const documents = await displayCursor.toArray();
			const totalNumUsers =
				parseInt(page) === 0 ? await UsersDAO.#users.countDocuments({}) : 0;
			return {
				data: documents,
				totalNumUsers,
				statusCode: documents.length > 0 ? 200 : 404,
			};
		} catch (e) {
			logger.error(
				`Unable to convert cursor to array or problem counting documents, ${e.message}`
			);
			throw e;
		}
	}
	static async getUserByEmail(email) {
		return await UsersDAO.#users.findOne({
			email: email
		});
	}
	static async getUserByUsername(username) {
		return await UsersDAO.#users.findOne({
			username: username
		});
	}
	static async getUserById(id) {
		let cursor;
		try {
			const query = {
				_id: ObjectId(id)
			};
			const sort = UsersDAO.#DEFAULT_SORT
			cursor = await UsersDAO.#users.find(query).sort(sort);
		} catch (e) {
			logger.error("Error occurred: " + e.message, "getUserById()");
			throw e;
		}
		try {
			const user = await cursor.toArray();
			if (user) {
				return {
					data: user,
					statusCode: 200
				};
			} else {
				const message = "No document matching id: " + id + " could be found!";
				logger.error(message, "getUserById()");
				return {
					data: [],
					statusCode: 404
				};
			}
		} catch (e) {
			logger.error(
				`Unable to convert cursor to array or problem counting documents, ${e.message}`,
				"getUserById()"
			);
			throw e;
		}
	}
	static async updateUser(id, updateObject) {
		try {
			const result = await UsersDAO.#users.updateOne({
				_id: ObjectId(id)
			}, {
				$set: updateObject
			});
			if (result) {
				return {
					data: {
						success: true
					},
					statusCode: 201
				};
			}
		} catch (e) {
			logger.error(`Error occurred while updating user, ${e}`, "updateUser()");
			throw e;
		}
	}
}

export default UsersDAO;
