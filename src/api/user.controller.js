import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


class User {
	constructor({
		_id,
		username,
		email,
		firstName,
		lastName,
		password,
		role,
		isActive
	} = {}) {
		this._id = _id;
		this.username = username;
		this.email = email;
		this.firstName = firstName;
		this.lastName = lastName;
		this.password = password;
		this.role = role;
		this.isActive = isActive;
	}
	toJson() {
		return {
			userId: this._id,
			isActive: this.isActive
		};
	}
	static async hashPassword(password) {
		return await bcrypt.hash(password, 10);
	}
	async comparePassword(plainText) {
		return await bcrypt.compare(plainText, this.password);
	}
	encoded(exp_date) {
		return jwt.sign({
				exp: exp_date,
				...this.toJson(),
			},
			process.env.SECRET_KEY
		);
	}
	static async decoded(userJwt) {
		return jwt.verify(userJwt, process.env.SECRET_KEY, (error, res) => {
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
		//
	}
}

export default UserController;
