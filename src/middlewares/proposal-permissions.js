import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";

const onlyProposalOwnerCanDoThisAction = async (req, res, next) => {
  const { aud } = req.jwt;
  const proposalId =
    req.params.proposalId || req.body.proposalId || req.query.proposalId;
  const proposal = await DAOs.proposalsDAO.getProposalByProposalId(proposalId);
  const freelancer = await DAOs.freelancersDAO.getFreelancerByUserId(aud);
  if (!freelancer || !proposal) {
    next(
      ApiError.forbidden(
        "Access denied: Only proposal owner can do this action",
      ),
    );
    return;
  }
  const { _id } = freelancer;
  if (_id.toString() === proposal.freelancerId.toString()) {
    return next();
  }
  next(
    ApiError.forbidden("Access denied: Only proposal owner can do this action"),
  );
  return;
};

export default { onlyProposalOwnerCanDoThisAction };
