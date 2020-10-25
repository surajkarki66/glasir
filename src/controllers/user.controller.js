import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import writeServerResponse from "../utils/utils";
import ApiError from "../error/ApiError";
import { usersDAO } from "../dao/index";
import UsersDAO from "../dao/userDAO";

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
    joinedDate,
  } = {}) {
    this._id = _id;
    this.username = username;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
    this.role = role;
    this.isActive = isActive;
    this.joinedDate = joinedDate;
  }
  toJson() {
    return {
      userId: this._id,
      isActive: this.isActive,
      joinedDate: this.joinedDate,
    };
  }
  encoded(exp_date, secretKey) {
    return jwt.sign(
      {
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
          error,
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
      const { email, username } = userFromBody;
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
          joinedDate: insertResult.data.joined_date,
        };
        const user = new User(userFromDb);
        const token = user.encoded(
          Math.floor(Date.now() / 1000) + 60 * 60,
          process.env.ACTIVATION_JWT_SECRET
        ); // one hour exp.
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
        writeServerResponse(
          res,
          mailOptions,
          insertResult.statusCode,
          "application/json"
        );
      }
    } catch (e) {
      next(ApiError.internal(`Something went wrong: ${e.message}`));
      return;
    }
  }
  static async activation(req, res, next) {
    const { token } = req.params;
    if (token) {
      jwt.verify(token, process.env.ACTIVATION_JWT_SECRET, (err, decoded) => {
        if (err) {
          next(ApiError.unauthorized("Expired link. Signup again."));
          return;
        } else {
          const { userId } = jwt.decode(token);

          const updateObject = {
            isActive: true,
          };
          usersDAO
            .updateUser(userId, updateObject)
            .then((result) => {
              writeServerResponse(
                res,
                {
                  message: "User activated successfully.",
                },
                result.statusCode,
                "application/json"
              );
            })
            .catch((err) => {
              next(ApiError.unauthorized(`User doesnot exist: ${err.message}`));
              return;
            });
        }
      });
    } else {
      next(ApiError.internal("Error happening please try again."));
      return;
    }
  }
  static async verifyEmail(req, res, next) {
    try {
      const { id } = req.params;
      const user = await usersDAO.getUserById(id);
      if (user) {
        const { _id, isActive, joined_date, email } = user.data;
        const newUser = new User({ _id, isActive, joined_date });
        const token = newUser.encoded(
          Math.floor(Date.now() / 1000) + 60 * 60,
          process.env.ACTIVATION_JWT_SECRET
        ); // one hour duration.
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
        writeServerResponse(
          res,
          mailOptions,
          user.statusCode,
          "application/json"
        );
      } else {
        next(ApiError.notfound("User doesnot exist."));
        return;
      }
    } catch (err) {
      next(ApiError.internal(`Something wen wrong. ${err}`));
      return;
    }
  }
  static async login(req, res, next) {
    try {
      const { username, email, password } = req.body;
      if (username) {
        const userData = await usersDAO.getUserByUsername(username);
        if (!userData) {
          next(ApiError.unauthorized("Make sure your username is correct."));
          return;
        } else {
          const user = new User(userData);
          if (!(await user.comparePassword(password))) {
            next(ApiError.unauthorized("Make sure your password is correct."));
            return;
          }
          const data = {
            auth_token: user.encoded(
              Math.floor(Date.now() / 1000) + 60 * 60,
              process.env.JWT_SECRET
            ),
            info: user.toJson(),
          };
          writeServerResponse(res, data, 200, "application/json");
        }
      }
      if (email) {
        const userData = await usersDAO.getUserByEmail(email);
        if (!userData) {
          next(ApiError.unauthorized("Make sure your email is correct."));
          return;
        } else {
          const user = new User(userData);
          if (!(await user.comparePassword(password))) {
            next(ApiError.unauthorized("Make sure your password is correct."));
            return;
          }
          const data = {
            auth_token: user.encoded(
              Math.floor(Date.now() / 1000) + 60 * 60,
              process.env.JWT_SECRET
            ),
            info: user.toJson(),
          };
          writeServerResponse(res, data, 200, "application/json");
        }
      }
    } catch (e) {
      next(ApiError.internal(`Something went wrong: ${e.message}`));
      return;
    }
  }
}

export default UserController;
