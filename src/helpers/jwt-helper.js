import jwt from "jsonwebtoken";
import createError from "http-errors";

import redisServer from "../helpers/init_redis";

const client = redisServer();

const sign = (payload, secret, options, isRefresh = false) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        reject(createError.InternalServerError());
        return;
      }
      if (isRefresh) {
        client.SET(
          userId,
          options.audience,
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
const signToken = (userId, type, expiresIn) => {
  let secret;
  let options;
  let payload = {};
  switch (type) {
    case "ACCESS":
      secret = process.env.ACCESS_TOKEN_SECRET;
      options = {
        expiresIn: expiresIn,
        issuer: "pickurpage.com",
        audience: userId.toString(),
      };
      return sign(payload, secret, options);
    case "REFRESH":
      secret = process.env.REFRESH_TOKEN_SECRET;
      options = {
        expiresIn: expiresIn,
        issuer: "pickurpage.com",
        audience: userId.toString(),
      };
      return sign(payload, secret, options, (isRefresh = true));
    case "ACTIVATION":
      secret = process.env.ACTIVATION_TOKEN_SECRET;
      options = {
        expiresIn: expiresIn,
        issuer: "pickurpage.com",
        audience: userId.toString(),
      };
      return sign(payload, secret, options);

    default:
    //
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
      if (err) return reject(createError.Unauthorized());
      const userId = payload.aud;
      client.GET(userId, (err, result) => {
        if (err) {
          reject(createError.InternalServerError());
          return;
        }
        if (refreshToken === result) return resolve(userId);
        reject(createError.Unauthorized());
      });
    });
  });
};

export { signToken, verifyToken, verifyRefreshToken };
