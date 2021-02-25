import jwt from "jsonwebtoken";

import config from "../config/config";
import ApiError from "../error/ApiError";

export const checkAuth = async (req, res, next) => {
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
