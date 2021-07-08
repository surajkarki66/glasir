import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";

const onlyContractOwnerCanDoThisAction = async (req, res, next) => {
  const { aud, role } = req.jwt;
  const contractId =
    req.params.contractId || req.body.contractId || req.query.contractId;
  const contract = await DAOs.contractsDAO.getContractByContractId(contractId);
  if (contract) {
    const { freelancer, employer } = contract;
    if (role === "freelancer") {
      const f = await DAOs.freelancersDAO.getFreelancerByUserId(aud);
      if (f && f._id.toString() === freelancer.toString()) {
        return next();
      }
      next(
        ApiError.forbidden(
          "Access denied: Only contract owners can do this action",
        ),
      );
      return;
    }
    if (role === "employer") {
      const e = await DAOs.employersDAO.getEmployerByUserId(aud);
      if (e && e._id.toString() === employer.toString()) {
        return next();
      }
      next(
        ApiError.forbidden(
          "Access denied: Only contract owners can do this action",
        ),
      );
      return;
    }
  }
  next(
    ApiError.forbidden(
      "Access denied: Only contract owners can do this action",
    ),
  );
  return;
};

export default { onlyContractOwnerCanDoThisAction };
