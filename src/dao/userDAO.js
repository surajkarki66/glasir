import logger from "../utils/logger";

class UsersDAO {
	static #users;
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
			});
			console.log(result)
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
}

export default UsersDAO;
