import ApiError from "../errors/ApiError";

export const onlyClientCanDoThisAction = (req, res, next) => {
  const { role } = req.jwt;
  if (role === "client") {
    return next();
  }
  next(ApiError.forbidden("Access denied: Only client can do this action"));
  return;
};
