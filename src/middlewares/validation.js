import jwt from "jsonwebtoken";

import config from "../configs/config";
import ApiError from "../errors/ApiError";

const checkAuth = async (req, res, next) => {
  if (req.headers["authorization"]) {
    const authorization = req.headers["authorization"].split(" ");
    if (authorization[0] !== "Bearer") {
      next(ApiError.unauthorized("Authentication failed."));
      return;
    } else {
      jwt.verify(
        authorization[1],
        config.secretToken.accessToken,
        (error, res) => {
          if (error) {
            next(ApiError.forbidden(`Token is not verified: ${error}`));
            return;
          }
          req.jwt = res;
          return next();
        },
      );
    }
  } else {
    next(ApiError.unauthorized("Authentication failed"));
    return;
  }
};

const dataValidation = (schema, property) => {
  return async (req, res, next) => {
    try {
      const value = await schema.validateAsync(req[property]);
      req[property] = value;
      next();
    } catch (err) {
      const { details } = err;
      const message = details.map((i) => i.message).join(",");
      next(ApiError.badRequest(message));
      return;
    }
  };
};

export default { dataValidation, checkAuth };
