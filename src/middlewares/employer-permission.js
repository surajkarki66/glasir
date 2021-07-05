import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";

const onlyEmployerCanDoThisAction = (req, res, next) => {
  const { role } = req.jwt;
  if (role === "employer") {
    return next();
  }
  next(ApiError.forbidden("Access denied: Only employer can do this action"));
  return;
};

const onlySameEmployerCanDoThisAction = async (req, res, next) => {
  const { aud } = req.jwt;
  const employerId =
    req.params.employerId || req.body.employerId || req.query.employerId;
  const result = await DAOs.employersDAO.getEmployerByUserId(aud);
  if (result && result._id.toString() === employerId) {
    return next();
  }
  next(
    ApiError.forbidden("Access denied: Only same employer can do this action"),
  );
  return;
};

export default { onlyEmployerCanDoThisAction, onlySameEmployerCanDoThisAction };
