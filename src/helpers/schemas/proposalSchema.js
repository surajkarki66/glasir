import Joi from "joi";

const schemas = {
  proposalCREATE: Joi.object().keys({
    jobId: Joi.string().length(24).hex().required(),
    freelancerId: Joi.string().length(24).hex().required(),
    projectLengthInHours: Joi.number().greater(0).required(),
    bidType: Joi.string().valid("fixed", "hourly").required(),
    fixedBidAmount: Joi.number()
      .greater(0)
      .when("bidType", { is: "fixed", then: Joi.required() }),
    hourlyBidAmount: Joi.number()
      .greater(0)
      .when("bidType", { is: "hourly", then: Joi.required() }),
    coverLetter: Joi.string().max(5000).required(),
    status: Joi.string().valid("initial", "active", "accepted").required(),
    createdAt: Joi.date().default(new Date()),
    updatedAt: Joi.date().default(new Date()),
  }),
  isProposalEXIST: Joi.object().keys({
    jobId: Joi.string().length(24).hex().required(),
    freelancerId: Joi.string().length(24).hex().required(),
  }),
  getMyProposalsLIST: Joi.object().keys({
    page: Joi.number().min(0).required(),
    proposalsPerPage: Joi.number().min(1).required(),
    freelancerId: Joi.string().length(24).hex().required(),
  }),
};

export default schemas;
