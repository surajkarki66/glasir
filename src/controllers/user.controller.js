import {
  signToken,
  verifyToken,
  verifyRefreshToken,
} from "../helpers/jwt-helper";
import DAOs from "../dao/index";
import mailGun from "../configs/mailgun";
import { client } from "../utils/redis";
import ApiError from "../errors/ApiError";
import config from "../configs/config";
import { writeServerResponse } from "../helpers/response";
import { comparePassword, hashPassword } from "../utils/utils";

async function getUsers(req, res, next) {
  try {
    const { page, usersPerPage } = req.query;
    const {
      success,
      data,
      statusCode,
      totalNumUsers,
    } = await DAOs.usersDAO.getUsers({
      page,
      usersPerPage,
    });
    if (success) {
      const users = {
        status: "success",
        data: data,
        page: Number(page),
        filters: {},
        entries_per_page: Number(usersPerPage),
        totalResults: totalNumUsers,
      };
      return writeServerResponse(res, users, statusCode, "application/json");
    }
    next(ApiError.notFound("Not found"));
    return;
  } catch (e) {
    next(ApiError.internal(`Something went wrong: ${e.message}`));
    return;
  }
}

async function login(req, res, next) {
  try {
    let userData;
    const { username, email, password } = req.body;
    if (username) {
      userData = await DAOs.usersDAO.getUserByUsername(username);
      if (!userData) {
        next(ApiError.badRequest("Make sure your username is correct."));
        return;
      }
    }
    if (email) {
      userData = await DAOs.usersDAO.getUserByEmail(email);
      if (!userData) {
        next(ApiError.badRequest("Make sure your email is correct."));
        return;
      }
    }
    const actualPassword = userData.password;
    const { _id, role, isActive } = userData;
    if (!(await comparePassword(password, actualPassword))) {
      next(ApiError.badRequest("Make sure your password is correct."));
      return;
    }
    const payload = { role, isActive };
    const accessToken = await signToken(_id, payload, "ACCESS", "1h");
    const refreshToken = await signToken(_id, payload, "REFRESH", "7d");

    const serverResponse = {
      status: "success",
      data: {
        message: "Login successful.",
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
    res.cookie("AccessToken", accessToken, {
      httpOnly: true,
      maxAge: 3600000,
    });
    res.cookie("RefreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 604800000,
    });

    return writeServerResponse(res, serverResponse, 200, "application/json");
  } catch (e) {
    next(ApiError.internal(`Something went wrong: ${e.message}`));
    return;
  }
}

async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await verifyRefreshToken(
      refreshToken,
      config.secretToken.refreshToken,
    );
    const { aud, role } = result;
    const payload = { role };
    const accessToken = await signToken(aud, payload, "ACCESS", "1h");
    const refToken = await signToken(aud, payload, "REFRESH", "7d");
    const serverResponse = {
      status: "success",
      data: { accessToken: accessToken, refreshToken: refToken },
    };
    res.cookie("AccessToken", accessToken, {
      httpOnly: true,
      maxAge: 3600000,
    });
    res.cookie("RefreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 604800000,
    });
    return writeServerResponse(res, serverResponse, 200, "application/json");
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

async function signup(req, res, next) {
  try {
    const userFromBody = req.body;
    const { email, username } = userFromBody;
    const email_result = DAOs.usersDAO.getUserByEmail(email);
    const username_result = DAOs.usersDAO.getUserByUsername(username);
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
        password: await hashPassword(userFromBody.password),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const { success, data, statusCode } = await DAOs.usersDAO.createUser(
        userInfo,
      );

      if (success) {
        const { _id, email, role } = data;
        const payload = { role };
        const token = await signToken(_id, payload, "ACTIVATION", "5m");
        const mailOptions = {
          from: "noreply@gmail.com",
          to: email,
          subject: "Account activation link",
          body: "Thank you for choosing Glasir !",
          html: `
           		<h1>Please use the following to activate your account</h1>
           		<p>${config.clientUrl}/user/activate/${token}</p>
           		<hr />
           		<p>This email may contain sensitive information</p>
           		<p>${config.clientUrl}</p>
           		 `,
        };
        mailGun.messages().send(mailOptions, (error, body) => {
          if (error) {
            next(ApiError.internal(`Something went wrong: ${error.message}`));
            return;
          }
          const serverResponse = {
            status: "success",
            data: {
              message:
                "Account created successfully.Please check your email for verification.",
            },
          };
          return writeServerResponse(
            res,
            serverResponse,
            statusCode,
            "application/json",
          );
        });
      } else {
        next(ApiError.badRequest(data.error));
        return;
      }
    }
  } catch (e) {
    next(ApiError.internal(`Something went wrong: ${e.message}`));
    return;
  }
}

async function activation(req, res, next) {
  try {
    const { token } = req.body;
    const result = await verifyToken(token, config.secretToken.activationToken);
    if (result.error) {
      next(ApiError.badRequest(result.error));
      return;
    }
    const userId = result.aud;
    const updateObject = {
      isActive: true,
      updatedAt: new Date(),
    };
    const { success, data, statusCode } = await DAOs.usersDAO.updateUser(
      userId,
      updateObject,
    );
    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: "User activated successfully." },
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    } else {
      next(ApiError.notfound(data.error));
      return;
    }
  } catch (err) {
    next(ApiError.internal(`Something went wrong. ${err.message}`));
    return;
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const { aud } = await verifyRefreshToken(
      refreshToken,
      config.secretToken.refreshToken,
    );
    client.del(aud, (err, val) => {
      if (err) {
        next(ApiError.internal("Something went wrong."));
        return;
      }
      const serverResponse = {
        status: "success",
        data: { message: "Logout successfully." },
      };
      return writeServerResponse(res, serverResponse, 200, "application/json");
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

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const result = await DAOs.usersDAO.getUserByEmail(email);
    if (result) {
      const { _id, role } = result;
      const payload = { role };
      const token = await signToken(_id, payload, "FORGOT", "5m");
      const mailOptions = {
        from: "noreply@gmail.com",
        to: email,
        subject: `Password Reset link`,
        html: `
                    <h1>Please use the following link to reset your password</h1>
                    <p>${config.clientUrl}/user/password-reset/${token}</p>
                    <hr />
                    <p>This email may contain sensitive information</p>
                    <p>${config.clientUrl}</p>
                `,
      };
      mailGun.messages().send(mailOptions, (error, body) => {
        if (error) {
          next(ApiError.internal(`Something went wrong: ${error.message}`));
          return;
        }
        const serverResponse = {
          status: "success",
          data: {
            message: `Email has been sent to ${email}. Follow the instruction to reset your password.`,
          },
        };
        return writeServerResponse(
          res,
          serverResponse,
          200,
          "application/json",
        );
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

async function resetPassword(req, res, next) {
  try {
    const { newPassword, token } = req.body;
    const result = await verifyToken(token, config.secretToken.forgotToken);
    if (result.error) {
      next(ApiError.badRequest(result.error));
      return;
    }
    const userId = result.aud;
    const updatedObject = {
      password: await hashPassword(newPassword),
      updatedAt: new Date(),
    };
    const { success, statusCode, data } = await DAOs.usersDAO.updateUser(
      userId,
      updatedObject,
    );
    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: "Great! Now you can login with your new password" },
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    } else {
      next(ApiError.notfound(data.error));
      return;
    }
  } catch (error) {
    next(ApiError.internal(`Something went wrong. ${error.message}`));
    return;
  }
}

async function changePassword(req, res, next) {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;
    const { success, data } = await DAOs.usersDAO.getUserById(userId);
    if (success) {
      const password = data.password;

      if (!(await comparePassword(oldPassword, password))) {
        next(ApiError.unauthorized("Make sure your password is correct."));
        return;
      }
      const updatedObject = {
        password: await hashPassword(newPassword),
        updatedAt: new Date(),
      };
      const { success, data2, statusCode } = await DAOs.usersDAO.updateUser(
        userId,
        updatedObject,
      );
      if (success) {
        const serverResponse = {
          status: "success",
          data: { message: "Password changed successfully." },
        };
        return writeServerResponse(
          res,
          serverResponse,
          statusCode,
          "application/json",
        );
      } else {
        next(ApiError.notfound(data2.error));
        return;
      }
    } else {
      next(ApiError.notfound("User doesn't exist."));
      return;
    }
  } catch (error) {
    next(ApiError.internal(`Something went wrong. ${error.message}`));
    return;
  }
}

async function changeUserDetails(req, res, next) {
  try {
    const userDetails = req.body;
    const { userId } = req.params;
    const updateObject = { ...userDetails, updatedAt: new Date() };

    const { username } = updateObject;
    const user = await DAOs.usersDAO.getUserByUsername(username);
    if (user && user._id.toString() !== userId) {
      next(ApiError.conflict("Username is already taken."));
      return;
    }

    const { success, data, statusCode } = await DAOs.usersDAO.updateUser(
      userId,
      updateObject,
    );
    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: "Update successfully." },
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    } else {
      next(ApiError.notfound(data.error));
      return;
    }
  } catch (error) {
    next(ApiError.internal(`Something went wrong. ${error.message}`));
    return;
  }
}
async function changeEmail(req, res, next) {
  try {
    const { userId } = req.params;
    const { email } = req.body;
    const user = await DAOs.usersDAO.getUserByEmail(email);
    const { role } = req.jwt;

    if (user && user._id.toString() !== userId) {
      next(ApiError.conflict("Email is already taken."));
      return;
    }
    const updateObject = {
      email: email,
      isActive: false,
      updatedAt: new Date(),
    };
    const { success, statusCode, data } = await DAOs.usersDAO.updateUser(
      userId,
      updateObject,
    );
    if (success) {
      const payload = { role };
      const token = await signToken(userId, payload, "ACTIVATION", "5m");
      const mailOptions = {
        from: "noreply@gmail.com",
        to: email,
        subject: "Account activation link",
        body: "Thank you for choosing Glasir !",
        html: `
						 <h1>Please use the following to activate your account</h1>
						 <p>${config.clientUrl}/user/activate/${token}</p>
						 <hr />
						 <p>This email may contain sensitive information</p>
						 <p>${config.clientUrl}</p>
							`,
      };
      mailGun.messages().send(mailOptions, (error, body) => {
        if (error) {
          next(ApiError.internal(`Something went wrong: ${error.message}`));
          return;
        }
        const serverResponse = {
          status: "success",
          data: {
            message: "Confirmation email is sent! Please check your email.",
          },
        };
        return writeServerResponse(
          res,
          serverResponse,
          statusCode,
          "application/json",
        );
      });
    } else {
      next(ApiError.notfound(data.error));
      return;
    }
  } catch (error) {
    next(ApiError.internal(`Something went wrong. ${error.message}`));
    return;
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { userId } = req.body;
    const { success, data, statusCode } = await DAOs.usersDAO.getUserById(
      userId,
    );
    if (success) {
      if (!data.isActive) {
        const { _id, role, email } = data;
        const payload = { role };
        const token = await signToken(_id, payload, "ACTIVATION", "5m");
        const mailOptions = {
          from: "noreply@gmail.com",
          to: email,
          subject: "Account activation link",
          body: "Thank you for choosing Glasir !",
          html: `
           		<h1>Please use the following to activate your account</h1>
           		<p>${config.clientUrl}/user/activate/${token}</p>
           		<hr />
           		<p>This email may contain sensitive information</p>
           		<p>${config.clientUrl}</p>
           		 `,
        };
        mailGun.messages().send(mailOptions, (error, body) => {
          if (error) {
            next(ApiError.internal(`Something went wrong: ${error.message}`));
            return;
          }
          const serverResponse = {
            status: "success",
            data: {
              message: "Confirmation email is sent! Please check your email.",
            },
          };
          return writeServerResponse(
            res,
            serverResponse,
            statusCode,
            "application/json",
          );
        });
      } else {
        const serverResponse = {
          status: "success",
          data: { message: "Email is already verified." },
        };
        return writeServerResponse(
          res,
          serverResponse,
          statusCode,
          "application/json",
        );
      }
    } else {
      next(ApiError.notfound("User doesn't exist."));
      return;
    }
  } catch (err) {
    next(ApiError.internal(`Something went wrong. ${err.message}`));
    return;
  }
}
async function getUserDetails(req, res, next) {
  try {
    const { userId } = req.params;
    const { success, data, statusCode } = await DAOs.usersDAO.getUserById(
      userId,
    );
    if (success) {
      const serverResponse = {
        status: "success",
        data: { ...data, password: null },
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    } else {
      next(ApiError.notfound("User doesn't exist."));
      return;
    }
  } catch (error) {
    next(ApiError.internal("Something went wrong: ", error.messages));
    return;
  }
}
async function deleteUser(req, res, next) {
  try {
    const { password } = req.body;
    const { userId } = req.params;
    const { role } = req.jwt;
    const { success, data } = await DAOs.usersDAO.getUserById(userId);
    if (success) {
      const actualPassword = data.password;

      if (!(await comparePassword(password, actualPassword))) {
        next(ApiError.unauthorized("Make sure your password is correct."));
        return;
      }
      const deleteUser = DAOs.usersDAO.deleteUser(userId);
      const deleteFreelancerOrClient =
        role === "freelancer"
          ? DAOs.freelancersDAO.deleteFreelancerByUserId(userId)
          : DAOs.clientsDAO.deleteClientByUserId(userId);
      const result = await Promise.all([deleteUser, deleteFreelancerOrClient]);
      if (result) {
        const serverResponse = {
          status: "success",
          data: { message: "Deleted successfully." },
        };
        return writeServerResponse(
          res,
          serverResponse,
          200,
          "application/json",
        );
      }
      next(ApiError.notfound("User or Freelancer or Client not found."));
      return;
    }
    next(ApiError.notfound("User doesn't exist."));
    return;
  } catch (e) {
    next(ApiError.internal(`Something went wrong: ${e.message}`));
    return;
  }
}

export default {
  getUsers,
  login,
  refreshToken,
  signup,
  activation,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  changeUserDetails,
  changeEmail,
  verifyEmail,
  deleteUser,
  getUserDetails,
};
