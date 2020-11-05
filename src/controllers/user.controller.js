import bcrypt from "bcryptjs";

import writeServerResponse from "../utils/utils";
import ApiError from "../error/ApiError";
import { usersDAO } from "../dao/index";
import {
  signToken,
  verifyToken,
  verifyRefreshToken,
} from "../helpers/jwt-helper";
import client from "../helpers/init_redis";
import mg from "../helpers/mail-gun";

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
          const token = await signToken(
            user._id,
            user.role,
            "ACTIVATION",
            "5m"
          );
          const mailOptions = {
            from: `Glasir <${process.env.COMPANY}>`,
            to: data.email,
            subject: "Account activation link",
            body: "Thank you for choosing Glasir !",
            html: `
           		<h1>Please use the following to activate your account</h1>
           		<p>${process.env.CLIENT_URL}/user/activate/${token}</p>
           		<hr />
           		<p>This email may contain sensetive information</p>
           		<p>${process.env.CLIENT_URL}</p>
           		 `,
          };
          mg.messages().send(mailOptions, (error, body) => {
            if (error) {
              next(ApiError.internal(`Something went wrong: ${error.message}`));
              return;
            }
            const data = {
              message:
                "Account created successfully.Please check your email for verification.",
            };
            return writeServerResponse(
              res,
              data,
              insertResult.statusCode,
              "application/json"
            );
          });
        } else {
          next(ApiError.conflict(insertResult.error));
          return;
        }
      }
    } catch (e) {
      next(ApiError.internal(`Something went wrong: ${e.message}`));
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
      const user = await usersDAO.updateUser(userId, updateObject);
      if (user.success) {
        return writeServerResponse(
          res,
          {
            message: "User activated successfully.",
          },
          user.statusCode,
          "application/json"
        );
      } else {
        next(ApiError.notfound(user.data.message));
        return;
      }
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
          const token = await signToken(
            user._id,
            user.role,
            "ACTIVATION",
            "5m"
          );
          const mailOptions = {
            from: `Glasir <${process.env.COMPANY}>`,
            to: data.email,
            subject: "Account activation link",
            body: "Thank you for choosing Glasir !",
            html: `
           		<h1>Please use the following to activate your account</h1>
           		<p>${process.env.CLIENT_URL}/user/activate/${token}</p>
           		<hr />
           		<p>This email may contain sensetive information</p>
           		<p>${process.env.CLIENT_URL}</p>
           		 `,
          };
          mg.messages().send(mailOptions, (error, body) => {
            if (error) {
              next(ApiError.internal(`Something went wrong: ${error.message}`));
              return;
            }
            const data = {
              message: "Confirmation email is sent! Please check your email.",
            };
            return writeServerResponse(
              res,
              data,
              result.statusCode,
              "application/json"
            );
          });
        } else {
          return writeServerResponse(
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
      next(ApiError.internal(`Something went wrong. ${err.message}`));
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
          const accessToken = await signToken(
            user._id,
            user.role,
            "ACCESS",
            "1h"
          );
          const refreshToken = await signToken(
            user._id,
            user.role,
            "REFRESH",
            "7d"
          );
          const data = {
            message: "Login successfull.",
            accessToken: accessToken,
            refreshToken: refreshToken,
          };
          res.cookie("AccessToken", accessToken, {
            httpOnly: true,
            maxAge: 3600000,
          });
          res.cookie("RefreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 604800000,
          });
          return writeServerResponse(res, data, 200, "application/json");
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
          const accessToken = await signToken(
            user._id,
            user.role,
            "ACCESS",
            "1h"
          );
          const refreshToken = await signToken(
            user._id,
            user.role,
            "REFRESH",
            "7d"
          );
          const data = {
            message: "Login successfull.",
            accessToken: accessToken,
            refreshToken: refreshToken,
          };
          res.cookie("AccessToken", accessToken, {
            httpOnly: true,
            maxAge: 3600000,
          });
          res.cookie("RefreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 604800000,
          });
          return writeServerResponse(res, data, 200, "application/json");
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
      const result = await verifyRefreshToken(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const { aud, role } = result;

      const accessToken = await signToken(aud, role, "ACCESS", "1h");
      const refToken = await signToken(aud, role, "REFRESH", "7d");
      const data = { accessToken: accessToken, refreshToken: refToken };
      res.cookie("AccessToken", accessToken, {
        httpOnly: true,
        maxAge: 3600000,
      });
      res.cookie("RefreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 604800000,
      });
      return writeServerResponse(res, data, 200, "application/json");
    } catch (error) {
      if (String(error).startsWith("UnauthorizedError")) {
        next(ApiError.unauthorized("Expired link. Signup again."));
        return;
      }
      if (String(error).startsWith("BadRequestError")) {
        next(ApiError.badRequest("Invalid token."));
        return;
      }
      if (String(error).startsWith("ForbiddenError")) {
        next(ApiError.forbidden("Invalid token."));
        return;
      }
      next(ApiError.internal("Something went wrong."));
      return;
    }
  }
  static async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const userId = await verifyRefreshToken(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      client.del(userId, (err, val) => {
        if (err) {
          next(ApiError.internal("Something went wrong."));
          return;
        }
        return writeServerResponse(
          res,
          { message: "Logout successfully." },
          204,
          "application/json"
        );
      });
    } catch (error) {
      if (String(error).startsWith("UnauthorizedError")) {
        next(ApiError.unauthorized("Expired link. Signup again."));
        return;
      }
      if (String(error).startsWith("BadRequestError")) {
        next(ApiError.badRequest("Invalid token."));
        return;
      }
      if (String(error).startsWith("ForbiddenError")) {
        next(ApiError.forbidden("Invalid token."));
        return;
      }
      next(ApiError.internal("Something went wrong."));
      return;
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;
      const result = await usersDAO.getUserById(id);
      if (result.success) {
        const newUser = new User(result.data);

        if (!(await newUser.comparePassword(oldPassword))) {
          next(ApiError.unauthorized("Make sure your password is correct."));
          return;
        }
        const updatedPassword = {
          password: await User.hashPassword(newPassword),
        };
        const user = await usersDAO.updateUser(id, updatedPassword);
        if (user.success) {
          return writeServerResponse(
            res,
            {
              message: "Password changed successfully.",
            },
            user.statusCode,
            "application/json"
          );
        } else {
          next(ApiError.notfound(user.data.message));
          return;
        }
      } else {
        next(ApiError.notfound("User doesnot exist."));
        return;
      }
    } catch (error) {
      next(ApiError.internal(`Something went wrong. ${error.message}`));
      return;
    }
  }
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await usersDAO.getUserByEmail(email);
      if (result) {
        const { _id, role } = result;
        const token = await signToken(_id, role, "FORGOT", "5m");
        const mailOptions = {
          from: `Glasir <${process.env.COMPANY}>`,
          to: email,
          subject: `Password Reset link`,
          html: `
                    <h1>Please use the following link to reset your password</h1>
                    <p>${process.env.CLIENT_URL}/user/password-reset/${token}</p>
                    <hr />
                    <p>This email may contain sensetive information</p>
                    <p>${process.env.CLIENT_URL}</p>
                `,
        };
        mg.messages().send(mailOptions, (error, body) => {
          if (error) {
            next(ApiError.internal(`Something went wrong: ${error.message}`));
            return;
          }
          const data = {
            message: `Email has been sent to ${email}. Follow the instruction to reset your password.`,
          };
          return writeServerResponse(res, data, 200, "application/json");
        });
      } else {
        next(ApiError.notfound("User with that email does not exist"));
        return;
      }
    } catch (error) {
      next(ApiError.internal(`Something went wrong: ${e.message}`));
      return;
    }
  }
  static async resetPassword(req, res, next) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
      const result = await verifyToken(token, process.env.FORGOT_TOKEN_SECRET);
      if (result.error) {
        next(ApiError.badRequest(result.error));
        return;
      }
      const userId = result.aud;
      const updatedPassword = {
        password: await User.hashPassword(newPassword),
      };
      const user = await usersDAO.updateUser(userId, updatedPassword);
      if (user.success) {
        return writeServerResponse(
          res,
          {
            message: "Great! Now you can login with your new password",
          },
          user.statusCode,
          "application/json"
        );
      } else {
        next(ApiError.notfound(result.data.message));
        return;
      }
    } catch (error) {
      next(ApiError.internal(`Something went wrong. ${error.message}`));
      return;
    }
  }
  static async changeUserDetails(req, res, next) {
    try {
      const userDetails = req.body;
      const { id } = req.params;
      let updateObject = userDetails;

      if (updateObject.username) {
        const { username } = updateObject;
        const user = await usersDAO.getUserByUsername(username);
        if (user && user._id.toString() !== id) {
          next(ApiError.conflict("Username is already taken."));
          return;
        }
        updateObject = { ...updateObject, username: username };
      }
      const result = await usersDAO.updateUser(id, updateObject);
      if (result.success) {
        return writeServerResponse(
          res,
          {
            message: "Update successfully.",
          },
          result.statusCode,
          "application/json"
        );
      } else {
        next(ApiError.notfound(result.data.message));
        return;
      }
    } catch (error) {
      next(ApiError.internal(`Something went wrong. ${error.message}`));
      return;
    }
  }
  static async changeEmail(req, res, next) {
    try {
      const { email } = req.body;
      const { id } = req.params;
      const user = await usersDAO.getUserByEmail(email);
      const { role } = req.jwt;
      if (user && user._id.toString() !== id) {
        next(ApiError.conflict("Email is already taken."));
        return;
      }
      const updateObject = { email: email, isActive: false };
      const result = await usersDAO.updateUser(id, updateObject);
      if (result.success) {
        const token = await signToken(id, role, "ACTIVATION", "5m");
        const mailOptions = {
          from: `Glasir <${process.env.COMPANY}>`,
          to: email,
          subject: "Account activation link",
          body: "Thank you for choosing Glasir !",
          html: `
						 <h1>Please use the following to activate your account</h1>
						 <p>${process.env.CLIENT_URL}/user/activate/${token}</p>
						 <hr />
						 <p>This email may contain sensetive information</p>
						 <p>${process.env.CLIENT_URL}</p>
							`,
        };
        mg.messages().send(mailOptions, (error, body) => {
          if (error) {
            next(ApiError.internal(`Something went wrong: ${error.message}`));
            return;
          }
          const data = {
            message: "Confirmation email is sent! Please check your email.",
          };
          return writeServerResponse(
            res,
            data,
            result.statusCode,
            "application/json"
          );
        });
      } else {
        next(ApiError.notfound(result.data.message));
        return;
      }
    } catch (error) {
      next(ApiError.internal(`Something went wrong. ${error.message}`));
      return;
    }
  }

  static async getUsers(req, res, next) {
    try {
      const { page, usersPerPage } = req.query;
      const result = await usersDAO.getUsers({
        page,
        usersPerPage,
      });
      if (result.success) {
        const users = {
          users: result.data,
          page: Number(page),
          filters: {},
          entries_per_page: Number(usersPerPage),
          totalResults: result.totalNumUsers,
        };
        return writeServerResponse(
          res,
          users,
          result.statusCode,
          "application/json"
        );
      }
      next(ApiError.notFound("Users not found."));
      return;
    } catch (e) {
      next(ApiError.internal(`Something went wrong: ${e.message}`));
      return;
    }
  }
  static async getUserDetails(req, res, next) {
    try {
      const id = req.params.id;
      const result = await usersDAO.getUserById(id);
      if (result.success) {
        const { data } = result;
        return writeServerResponse(
          res,
          data,
          result.statusCode,
          "application/json"
        );
      } else {
        next(ApiError.notfound("User doesnot exist."));
        return;
      }
    } catch (error) {
      next(ApiError.internal("Something went wrong: ", error.messages));
      return;
    }
  }
  static async delete(req, res, next) {
    try {
      const { password } = req.body;
      const { id } = req.params;
      const result = await usersDAO.getUserById(id);
      if (result.success) {
        const user = new User(result.data);

        if (!(await user.comparePassword(password))) {
          next(ApiError.unauthorized("Make sure your password is correct."));
          return;
        }
        const deleteResult = await usersDAO.deleteUser(id);
        if (deleteResult.success) {
          return writeServerResponse(
            res,
            { message: "Deleted successfully." },
            deleteResult.statusCode,
            "application/json"
          );
        }
        next(ApiError.notfound("User doesnot exist."));
        return;
      }
      next(ApiError.notfound("User doesnot exist."));
      return;
    } catch (e) {
      next(ApiError.internal(`Something went wrong: ${e.message}`));
      return;
    }
  }
}

export default UserController;
