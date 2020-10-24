import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import writeServerResponse from "../utils/utils";
import ApiError from "../error/ApiError";
import {
	usersDAO
} from "../dao/index";


class User {
	constructor({
		_id,
		username,
		email,
		firstName,
		lastName,
		password,
		role,
		isActive,
		joinedDate
	} = {}) {
		this._id = _id;
		this.username = username;
		this.email = email;
		this.firstName = firstName;
		this.lastName = lastName;
		this.password = password;
		this.role = role;
		this.isActive = isActive;
		this.joinedDate = joinedDate
	}
	toJson() {
		return {
			userId: this._id,
			isActive: this.isActive,
			joinedDate: this.joinedDate
		};
	}
	encoded(exp_date, secretKey) {
		return jwt.sign({
				exp: exp_date,
				...this.toJson(),
			},
			secretKey
		);
	}
	async comparePassword(plainText) {
		return await bcrypt.compare(plainText, this.password);
	}
	static async hashPassword(password) {
		return await bcrypt.hash(password, 10);
	}

	static async decoded(userJwt, secretKey) {
		return jwt.verify(userJwt, secretKey, (error, res) => {
			if (error) {
				return {
					error
				};
			}
			return new User(res);
		});
	}
}
class UserController {
	static async signup(req, res, next) {
		try {
			const userFromBody = req.body;
			const {
				email,
				username
			} = userFromBody;
			const email_result = usersDAO.getUserByEmail(email);
			const username_result = usersDAO.getUserByUsername(username);
			const result = await Promise.all([email_result, username_result]);

			if (result[0]) {
				next(ApiError.conflict("Email is already taken."));
				return;
			} else if (result[1]) {
				next(ApiError.conflict("Username is already taken."));
				return;
			} else {
				const userInfo = {
					...userFromBody,
					isActive: false,
					password: await User.hashPassword(userFromBody.password),
				};
				const insertResult = await usersDAO.createUser(userInfo);
				const userFromDb = {
					_id: insertResult.data._id,
					isActive: insertResult.data.isActive,
					joinedDate: insertResult.data.joined_date
				};
				const user = new User(userFromDb);
				const token = user.encoded(Math.floor(Date.now() / 1000) + (60 * 60), process.env.ACTIVATION_JWT_SECRET) // one hour exp.
				const mailOptions = {
					from: `"Glasir" ${process.env.USER}`,
					to: email,
					subject: "Account activation link",
					body: "Thank you for choosing Glasir !",
					html: `
					<h1>Please use the following to activate your account</h1>
					<p>${process.env.CLIENT_URL}/users/activate/${token}</p>
					<hr />
					<p>This email may contain sensetive information</p>
					<p>${process.env.CLIENT_URL}</p>
					 `,
				};
				// TODO: sending email.
				writeServerResponse(res, mailOptions, insertResult.statusCode, "application/json");
			}
		} catch (e) {
			next(ApiError.internal(`Something went wrong: ${e.message}`));
			return;
		}

	}
}

export default UserController;
