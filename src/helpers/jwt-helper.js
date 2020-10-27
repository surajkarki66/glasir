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
const signToken = (userId, type) => {
  let secret;
  let options;
  let payload = {};
  switch (type) {
    case "ACCESS":
      secret = process.env.ACCESS_TOKEN_SECRET;
      options = {
        expiresIn: "1h",
        issuer: "pickurpage.com",
        audience: userId.toString(),
      };
      return sign(payload, secret, options);
    case "REFRESH":
      secret = process.env.REFRESH_TOKEN_SECRET;
      options = {
        expiresIn: "7d",
        issuer: "pickurpage.com",
        audience: userId.toString(),
      };
      return sign(payload, secret, options);

    default:
    //
  }
};

export { signToken };
