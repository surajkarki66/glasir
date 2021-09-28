import jwt from "jsonwebtoken";
import createError from "http-errors";

import config from "../configs/config";

const sign = (payload, secret, options) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        reject(createError.InternalServerError());
        return;
      }

      resolve(token);
    });
  });
};
const signToken = (userId, payloadData, type, expiresIn) => {
  let secret;
  let options;
  let payload = {};
  switch (type) {
    case "ACCESS":
      payload = payloadData;
      secret = config.secretToken.accessToken;
      options = {
        expiresIn: expiresIn,
        issuer: "pickurpage.com",
        audience: userId.toString(),
      };
      return sign(payload, secret, options, false);

    case "ACTIVATION":
      payload = payloadData;
      secret = config.secretToken.activationToken;
      options = {
        expiresIn: expiresIn,
        issuer: "pickurpage.com",
        audience: userId.toString(),
      };
      return sign(payload, secret, options, false);

    case "FORGOT":
      payload = payloadData;
      secret = config.secretToken.forgotToken;
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
        return { error: "Activation link is expired !" };
      }
      if (String(error).startsWith("JsonWebTokenError")) {
        return { error: "Invalid token." };
      }
    }
    return response;
  });
};

export { sign, signToken, verifyToken };
