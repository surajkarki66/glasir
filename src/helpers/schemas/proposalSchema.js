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
  }),
  isProposalEXIST: Joi.object().keys({
    jobId: Joi.string().length(24).hex().required(),
    freelancerId: Joi.string().length(24).hex().required(),
  }),

  getProposalDETAILS: Joi.object().keys({
    proposalId: Joi.string().length(24).hex().required(),
  }),
  proposalDELETE: Joi.object().keys({
    proposalId: Joi.string().length(24).hex().required(),
    freelancerId: Joi.string().length(24).hex().required(),
  }),
  getFreelancerProposalsLIST: Joi.object().keys({
    page: Joi.number().min(1).required(),
    proposalsPerPage: Joi.number().min(1).required(),
    freelancerId: Joi.string().length(24).hex().required(),
    status: Joi.string().valid("initial", "active", "accepted").required(),
  }),
  getJobProposalsLIST: Joi.object().keys({
    page: Joi.number().min(1).required(),
    proposalsPerPage: Joi.number().min(1).required(),
    jobId: Joi.string().length(24).hex().required(),
  }),
  getJobProposalDETAILS: Joi.object().keys({
    proposalId: Joi.string().length(24).hex().required(),
  }),
  changeProposalDETAILS: Joi.object().keys({
    freelancerId: Joi.string().length(24).hex().required(),
    proposalId: Joi.string().length(24).hex().required(),
    bidType: Joi.string().valid("fixed", "hourly").required(),
    fixedBidAmount: Joi.number()
      .greater(0)
      .when("bidType", { is: "fixed", then: Joi.required() }),
    hourlyBidAmount: Joi.number()
      .greater(0)
      .when("bidType", { is: "hourly", then: Joi.required() }),
  }),
};

export default schemas;
