import { ObjectId } from "bson";

import DAOs from "../../dao/index";
import ApiError from "../../error/ApiError";
import writeServerResponse from "../../helpers/response";

export async function makeProfile(req, res, next) {
  try {
    const profileInfo = req.body;
    const { aud } = req.jwt;

    const user = await DAOs.usersDAO.getUserById(aud);
    if (user.success) {
      const info = {
        user: ObjectId(aud),
        ...profileInfo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await DAOs.freelancersDAO.createProfile(info);
      if (result.success) {
        const data = { message: "Your profile created successfully." };
        return writeServerResponse(
          res,
          data,
          result.statusCode,
          "application/json"
        );
      }
      return writeServerResponse(
        res,
        result.data.error,
        result.statusCode,
        "application/json"
      );
    } else {
      next(ApiError.badRequest("No user exist with that user id."));
      return;
    }
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

export async function me(req, res, next) {
  try {
    const { aud } = req.jwt;
    const result = await DAOs.freelancersDAO.me(aud);
    if (result.success) {
      const data = { status: "success", data: result.data };
      return writeServerResponse(
        res,
        data,
        result.statusCode,
        "application/json"
      );
    }
    const user = await DAOs.usersDAO.getUserById(aud);
    if (user.success) {
      const data = {
        status: "success",
        data: { ...user.data, password: null },
      };
      return writeServerResponse(
        res,
        data,
        user.statusCode,
        "application/json"
      );
    }
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
