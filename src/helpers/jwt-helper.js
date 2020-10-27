import jwt from "jsonwebtoken";
import createError from "http-errors";

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
      return sign(payload, secret, options);
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

export { signToken, verifyToken };
