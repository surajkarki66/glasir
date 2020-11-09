import ApiError from "../error/ApiError";

export const onlySameUserOrAdminCanDoThisAction = (req, res, next) => {
  const role = req.jwt.role;
  const userId = req.jwt.userId;
  if (req.params && req.params.id === userId) {
    return next();
  } else if (req.body.id && req.body.id === userId) {
    return next();
  } else if (req.params && req.body.id && req.body.id === userId) {
    return next();
  } else {
    if (role === "admin") {
      return next();
    } else {
      next(ApiError.forbidden("Access denied."));
      return;
    }
  }
};
export const onlySameUserCanDoThisAction = (req, res, next) => {
  const userId = req.jwt.aud;
  if (req.params && req.params.id === userId) {
    return next();
  } else if (req.body.id && req.body.id === userId) {
    return next();
  } else if (req.params && req.body.id && req.body.id === userId) {
    return next();
  } else {
    next(ApiError.badRequest("Access denied."));
    return;
  }
};
export const onlyAdminCanDoThisAction = (req, res, next) => {
  const role = req.jwt.role;
  if (role === "admin") {
    return next();
  } else {
    next(ApiError.forbidden("Access denied."));
    return;
  }
};
