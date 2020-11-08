import jwt from "jsonwebtoken";
import createError from "http-errors";

import { client } from "../utils/redis";

const sign = (payload, secret, options, isRefresh) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        reject(createError.InternalServerError());
        return;
      }
      if (isRefresh) {
        const userId = options.audience;
        client.set(
          userId,
          token,
          "EX",
          7 * 24 * 60 * 60, // 7 days
          (err, reply) => {
            if (err) {
              reject(createError.InternalServerError());
              return;
            }
            resolve(token);
          }
        );
      }
      resolve(token);
    });
  });
};
const signToken = (userId, role, type, expiresIn) => {
  let secret;
  let options;
  let payload = {};
  switch (type) {
    case "ACCESS":
      payload = { role: role };
      secret = process.env.ACCESS_TOKEN_SECRET;
      options = {
        expiresIn: expiresIn,
        issuer: "pickurpage.com",
        audience: userId.toString(),
      };
      return sign(payload, secret, options, false);
    case "REFRESH":
      payload = { role: role };
      secret = process.env.REFRESH_TOKEN_SECRET;
      options = {
        expiresIn: expiresIn,
        issuer: "pickurpage.com",
        audience: userId.toString(),
      };
      return sign(payload, secret, options, true);
    case "ACTIVATION":
      payload = { role: role };
      secret = process.env.ACTIVATION_TOKEN_SECRET;
      options = {
        expiresIn: expiresIn,
        issuer: "pickurpage.com",
        audience: userId.toString(),
      };
      return sign(payload, secret, options, false);

    case "FORGOT":
      payload = { role: role };
      secret = process.env.FORGOT_TOKEN_SECRET;
      options = {
        expiresIn: expiresIn,
        issuer: "pickurpage.com",
        audience: userId.toString(),
      };
      return sign(payload, secret, options, false);

    default:
    // pass
  }
};
const verifyToken = async (token, secretKey) => {
  return jwt.verify(token, secretKey, (error, response) => {
    if (error) {
      if (String(error).startsWith("TokenExpiredError")) {
        return { error: "Expired link. Signup again." };
      }
      if (String(error).startsWith("JsonWebTokenError")) {
        return { error: "Invalid token." };
      }
    }
    return response;
  });
};

const verifyRefreshToken = (refreshToken, secretKey) => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, secretKey, (err, payload) => {
      if (err) {
        if (String(err).startsWith("TokenExpiredError")) {
          return reject(
            createError.Unauthorized("Expired link. Signup again.")
          );
        }
        if (String(err).startsWith("JsonWebTokenError")) {
          return reject(createError.BadRequest("Invalid token."));
        }
      }
      const userId = payload.aud;
      client.get(userId.toString(), (err, result) => {
        if (err) {
          reject(createError.InternalServerError("Invalid refresh token."));
          return;
        }
        if (refreshToken === result) return resolve(payload);
        reject(
          createError.Forbidden("Refresh token is doesnot belongs to you.")
        );
      });
    });
  });
};

export { signToken, verifyToken, verifyRefreshToken };
