import ApiError from "../error/ApiError";

const onlySameUserCanDoThisAction = (req, res, next) => {
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
const onlyAdminCanDoThisAction = (req, res, next) => {
  const role = req.jwt.role;
  if (role === "admin") {
    return next();
  } else {
    next(ApiError.forbidden("Access denied."));
    return;
  }
};

export { onlySameUserCanDoThisAction, onlyAdminCanDoThisAction };
