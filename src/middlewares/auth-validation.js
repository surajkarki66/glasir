import jwt from "jsonwebtoken";
import crypto from "crypto";

import ApiError from "../error/ApiError";

const verifyRefreshBodyField = (req, res, next) => {
  if (req.body && req.body.refreshToken) {
    return next();
  } else {
    next(ApiError.badRequest("Need to pass refresh_token field."));
    return;
  }
};

const validRefreshNeeded = (req, res, next) => {
  const b = new Buffer.from(req.body.refreshToken, "base64");
  const refresh_token = b.toString();
  const hash = crypto
    .createHmac("sha512", req.jwt.refreshKey)
    .update(req.jwt.userId + secret)
    .digest("base64");
  if (hash === refresh_token) {
    req.body = req.jwt;
    return next();
  } else {
    throw new BadRequest("Invalid refresh token");
  }
};

const checkAuth = async (req, res, next) => {
  if (req.headers["authorization"]) {
    const authorization = req.headers["authorization"].split(" ");
    if (authorization[0] !== "Bearer") {
      next(ApiError.unauthorized("Authentication failed."));
      return;
    } else {
      jwt.verify(authorization[1], process.env.SECRET_KEY, (error, res) => {
        if (error) {
          next(ApiError.forbidden(`Token is not verified: ${error}`));
          return;
        }
        req.jwt = res;
        return next();
      });
    }
  } else {
    next(ApiError.unauthorized("Authentication failed"));
    return;
  }
};
export { verifyRefreshBodyField, validRefreshNeeded, checkAuth };
