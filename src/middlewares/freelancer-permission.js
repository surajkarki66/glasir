import DAOs from "../dao/index";
import ApiError from "../error/ApiError";

export const onlyFreelancerCanDoThisAction = (req, res, next) => {
  const { role } = req.jwt;
  if (role === "freelancer") {
    return next();
  }
  next(ApiError.forbidden("Access denied: Only freelancer can do this action"));
  return;
};

export const onlySameFreelancerCanDoThisAction = async (req, res, next) => {
  const { aud } = req.jwt;
  const freelancerId = req.params.freelancerId || req.body.freelancerId;
  const result = await DAOs.freelancersDAO.getFreelancerByUserId(aud);
  if (result && result.data._id.toString() === freelancerId) {
    return next();
  }
  next(
    ApiError.forbidden("Access denied: Only same freelancer can do this action")
  );
  return;
};
