import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";

const onlyJobOwnerCanDoThisAction = async (req, res, next) => {
  const { aud } = req.jwt;
  const jobId = req.params.jobId || req.body.jobId || req.query.jobId;
  const result = await DAOs.jobsDAO.getJobById(jobId);
  if (
    result &&
    result.data &&
    result.data.employer &&
    result.data.employer.user.toString() === aud
  ) {
    return next();
  }
  next(ApiError.forbidden("Access denied: Only job owner can do this action"));
  return;
};

export default { onlyJobOwnerCanDoThisAction };
