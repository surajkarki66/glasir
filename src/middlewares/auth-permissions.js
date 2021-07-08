import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";

const onlySameUserCanDoThisAction = (req, res, next) => {
  const userId = req.jwt.aud;
  if (req.params && req.params.userId === userId) {
    return next();
  } else if (req.body.userId && req.body.userId === userId) {
    return next();
  } else if (req.params && req.body.userId && req.body.userId === userId) {
    return next();
  } else {
    next(
      ApiError.forbidden("Access denied: Only same user can do this action"),
    );
    return;
  }
};
const onlySameUserOrAdminCanDoThisAction = (req, res, next) => {
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
          "Access denied: Only same user or admin can do this action",
        ),
      );
      return;
    }
  }
};

const onlyAdminCanDoThisAction = (req, res, next) => {
  const role = req.jwt.role;
  if (role === "admin") {
    return next();
  } else {
    next(ApiError.forbidden("Access denied: Only admin can do this action"));
    return;
  }
};

const onlyActiveUserCanDoThisAction = async (req, res, next) => {
  const { aud } = req.jwt;
  const { data } = await DAOs.usersDAO.getUserById(aud);
  const { isActive } = data;
  if (isActive) {
    return next();
  }
  next(
    ApiError.forbidden(
      "Access denied: User is required to verify their email.",
    ),
  );
  return;
};

const noAdminCanDoThisAction = (req, res, next) => {
  const { role } = req.jwt;
  if (role === "admin") {
    next(ApiError.forbidden("Access denied: No admin can do this action"));
    return;
  }
  return next();
};

export default {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
  onlyActiveUserCanDoThisAction,
  noAdminCanDoThisAction,
};
