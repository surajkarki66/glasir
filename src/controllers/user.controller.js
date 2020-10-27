import bcrypt from "bcryptjs";

import writeServerResponse from "../utils/utils";
import ApiError from "../error/ApiError";
import { usersDAO } from "../dao/index";
import { signToken, verifyToken } from "../helpers/jwt-helper";

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

  async comparePassword(plainText) {
    return await bcrypt.compare(plainText, this.password);
  }
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
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

        if (insertResult.success) {
          const { data } = insertResult;
          const user = new User(data);
          const token = await signToken(user._id, "ACTIVATION", "5m");
          const mailOptions = {
            from: `"Glasir" ${process.env.USER}`,
            to: data.email,
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
        } else {
          next(ApiError.conflict(insertResult.error));
          return;
        }
      }
    } catch (e) {
      next(ApiError.internal(`Something went wrong: ${e}`));
      return;
    }
  }
  static async activation(req, res, next) {
    try {
      const { token } = req.params;
      const result = await verifyToken(
        token,
        process.env.ACTIVATION_TOKEN_SECRET
      );
      if (result.error) {
        next(ApiError.badRequest(result.error));
        return;
      }
      const userId = result.aud;
      const updateObject = {
        isActive: true,
      };
      usersDAO
        .updateUser(userId, updateObject)
        .then((result) => {
          if (result.success) {
            writeServerResponse(
              res,
              {
                message: "User activated successfully.",
              },
              result.statusCode,
              "application/json"
            );
          } else {
            next(ApiError.notfound(result.data.message));
            return;
          }
        })
        .catch((err) => {
          next(ApiError.internal(`Something went wrong. ${err.message}`));
          return;
        });
    } catch (err) {
      next(ApiError.internal(`Something went wrong. ${err.message}`));
      return;
    }
  }
  static async verifyEmail(req, res, next) {
    try {
      const { id } = req.params;
      const result = await usersDAO.getUserById(id);
      if (result.success) {
        if (!result.data.isActive) {
          const { data } = result;
          const user = new User(data);
          const token = await signToken(user._id, "ACTIVATION", "5m");
          const mailOptions = {
            from: `"Glasir" ${process.env.USER}`,
            to: data.email,
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
            result.statusCode,
            "application/json"
          );
        } else {
          writeServerResponse(
            res,
            { message: "Email is already verified." },
            result.statusCode,
            "application/json"
          );
        }
      } else {
        next(ApiError.notfound("User doesnot exist."));
        return;
      }
    } catch (err) {
      next(ApiError.internal(`Something went wrong. ${err}`));
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
          const accessToken = await signToken(user._id, "ACCESS", "1h");
          const refreshToken = await signToken(user._id, "REFRESH", "7d");
          const data = {
            message: "Login successfull.",
            accessToken: accessToken,
            refreshToken: refreshToken,
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
          const accessToken = await signToken(user._id, "ACCESS", "1h");
          const refreshToken = await signToken(user._id, "REFRESH", "7d");
          const data = {
            message: "Login successfull.",
            accessToken: accessToken,
            refreshToken: refreshToken,
          };
          writeServerResponse(res, data, 200, "application/json");
        }
      }
    } catch (e) {
      next(ApiError.internal(`Something went wrong: ${e.message}`));
      return;
    }
  }
  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const userId = await verifyRefreshToken(refreshToken);

      const accessToken = await signAccessToken(userId);
      const refToken = await signRefreshToken(userId);
      res.send({ accessToken: accessToken, refreshToken: refToken });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
