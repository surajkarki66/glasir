import ApiError from "../error/ApiError";

export const onlySameUserCanDoThisAction = (req, res, next) => {
  const userId = req.jwt.aud;
  if (req.params && req.params.userId === userId) {
    return next();
  } else if (req.body.userId && req.body.userId === userId) {
    return next();
  } else if (req.params && req.body.userId && req.body.userId === userId) {
    return next();
  } else {
    next(
      ApiError.forbidden("Access denied: Only same user can do this action")
    );
    return;
  }
};
export const onlySameUserOrAdminCanDoThisAction = (req, res, next) => {
  const role = req.jwt.role;
  const userId = req.jwt.aud;
  if (req.params && req.params.userId === userId) {
    return next();
  } else if (req.body.userId && req.body.userId === userId) {
    return next();
  } else if (req.params && req.body.userId && req.body.userId === userId) {
    return next();
  } else {
    if (role === "admin") {
      return next();
    } else {
      next(
        ApiError.forbidden(
          "Access denied: Only same user or admin can do this action"
        )
      );
      return;
    }
  }
};

export const onlyAdminCanDoThisAction = (req, res, next) => {
  const role = req.jwt.role;
  if (role === "admin") {
    return next();
  } else {
    next(ApiError.forbidden("Access denied: Only admin can do this action"));
    return;
  }
};
