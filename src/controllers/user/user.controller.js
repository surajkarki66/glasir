import moment from "moment";

import {
  signToken,
  verifyToken,
  verifyRefreshToken,
} from "../../helpers/jwt-helper";
import DAOs from "../../dao/index";
import mg from "../../helpers/mailgun";
import { client } from "../../utils/redis";
import ApiError from "../../error/ApiError";
import writeServerResponse from "../../helpers/response";
import { comparePassword, hashPassword } from "../../utils/utils";

export async function getUsers(req, res, next) {
  try {
    const { page, usersPerPage } = req.query;
    const result = await DAOs.usersDAO.getUsers({
      page,
      usersPerPage,
    });
    if (result.success) {
      const users = {
        status: "success",
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

export async function login(req, res, next) {
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
    const { _id, role } = userData;
    if (!(await comparePassword(password, actualPassword))) {
      next(ApiError.badRequest("Make sure your password is correct."));
      return;
    }

    const accessToken = await signToken(_id, role, "ACCESS", "1h");
    const refreshToken = await signToken(_id, role, "REFRESH", "7d");

    const data = {
      status: "success",
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
  } catch (e) {
    next(ApiError.internal(`Something went wrong: ${e.message}`));
    return;
  }
}

export async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await verifyRefreshToken(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const { aud, role } = result;

    const accessToken = await signToken(aud, role, "ACCESS", "1h");
    const refToken = await signToken(aud, role, "REFRESH", "7d");
    const data = {
      status: "success",
      accessToken: accessToken,
      refreshToken: refToken,
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

export async function signup(req, res, next) {
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
        updatedAt: null,
      };
      const insertResult = await DAOs.usersDAO.createUser(userInfo);

      if (insertResult.success) {
        const { _id, email, role } = insertResult.data;
        const token = await signToken(_id, role, "ACTIVATION", "5m");
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
            status: "success",
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

export async function uploadAvatar(req, res, next) {
  try {
    const file = req.file;
    if (!file) {
      next(ApiError.unprocessable("No image selected."));
      return;
    }
    const { id } = req.params;
    const updateObject = { avatar: file.filename, updatedAt: new Date() };
    const user = await DAOs.usersDAO.updateUser(id, updateObject);
    if (user.success) {
      return writeServerResponse(
        res,
        {
          status: "success",
          message: "Avatar uploaded successfully.",
        },
        user.statusCode,
        "application/json"
      );
    } else {
      next(ApiError.notfound(user.data.message));
      return;
    }
  } catch (error) {
    next(ApiError.internal(`Something went wrong. ${err.message}`));
    return;
  }
}
export async function activation(req, res, next) {
  try {
    const { token } = req.body;
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
      updatedAt: new Date(),
    };
    const user = await DAOs.usersDAO.updateUser(userId, updateObject);
    if (user.success) {
      return writeServerResponse(
        res,
        {
          status: "success",
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

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const { aud } = await verifyRefreshToken(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    client.del(aud, (err, val) => {
      if (err) {
        next(ApiError.internal("Something went wrong."));
        return;
      }
      return writeServerResponse(
        res,
        { status: "success", message: "Logout successfully." },
        200,
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

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const result = await DAOs.usersDAO.getUserByEmail(email);
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
          status: "success",
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

export async function resetPassword(req, res, next) {
  try {
    const { newPassword, token } = req.body;
    const result = await verifyToken(token, process.env.FORGOT_TOKEN_SECRET);
    if (result.error) {
      next(ApiError.badRequest(result.error));
      return;
    }
    const userId = result.aud;
    const updatedObject = {
      password: await hashPassword(newPassword),
      updatedAt: new Date(),
    };
    const user = await DAOs.usersDAO.updateUser(userId, updatedObject);
    if (user.success) {
      return writeServerResponse(
        res,
        {
          status: "success",
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

export async function changePassword(req, res, next) {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    const result = await DAOs.usersDAO.getUserById(id);
    if (result.success) {
      const { password } = result.data;

      if (!(await comparePassword(oldPassword, password))) {
        next(ApiError.unauthorized("Make sure your password is correct."));
        return;
      }
      const updatedObject = {
        password: await hashPassword(newPassword),
        updatedAt: new Date(),
      };
      const user = await DAOs.usersDAO.updateUser(id, updatedObject);
      if (user.success) {
        return writeServerResponse(
          res,
          {
            status: "success",
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

export async function changeUserDetails(req, res, next) {
  try {
    const userDetails = req.body;
    const { id } = req.params;
    let updateObject = { ...userDetails, updatedAt: new Date() };

    if (updateObject.username) {
      const { username } = updateObject;
      const user = await DAOs.usersDAO.getUserByUsername(username);
      if (user && user._id.toString() !== id) {
        next(ApiError.conflict("Username is already taken."));
        return;
      }
      updateObject = { ...updateObject, username: username };
    }
    const result = await DAOs.usersDAO.updateUser(id, updateObject);
    if (result.success) {
      return writeServerResponse(
        res,
        {
          status: "success",
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
export async function changeEmail(req, res, next) {
  try {
    const { email } = req.body;
    const { id } = req.params;
    const user = await DAOs.usersDAO.getUserByEmail(email);
    const { role } = req.jwt;

    if (user && user._id.toString() !== id) {
      next(ApiError.conflict("Email is already taken."));
      return;
    }
    const updateObject = {
      email: email,
      isActive: false,
      updatedAt: new Date(),
    };
    const result = await DAOs.usersDAO.updateUser(id, updateObject);
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
          status: "success",
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

export async function verifyEmail(req, res, next) {
  try {
    const { id } = req.params;
    const result = await DAOs.usersDAO.getUserById(id);
    if (result.success) {
      if (!result.data.isActive) {
        const { _id, role, email } = result.data;
        const token = await signToken(_id, role, "ACTIVATION", "5m");
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
            status: "success",
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
          { status: "success", message: "Email is already verified." },
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
export async function getUserDetails(req, res, next) {
  try {
    const id = req.params.id;
    const result = await DAOs.usersDAO.getUserById(id);
    if (result.success) {
      const data = { status: "success", ...result.data };
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
export async function deleteUser(req, res, next) {
  try {
    const { password } = req.body;
    const { id } = req.params;
    const result = await DAOs.usersDAO.getUserById(id);
    if (result.success) {
      const actualPassword = result.data.password;

      if (!(await comparePassword(password, actualPassword))) {
        next(ApiError.unauthorized("Make sure your password is correct."));
        return;
      }
      const deleteResult = await DAOs.usersDAO.deleteUser(id);
      if (deleteResult.success) {
        return writeServerResponse(
          res,
          { status: "success", message: "Deleted successfully." },
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
