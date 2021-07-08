import Joi from "joi";

const schemas = {
  getFreelancerContractsLIST: Joi.object().keys({
    page: Joi.number().min(0).required(),
    contractsPerPage: Joi.number().min(1).required(),
    freelancerId: Joi.string().length(24).hex().required(),
  }),
  getEmployerContractsLIST: Joi.object().keys({
    page: Joi.number().min(0).required(),
    contractsPerPage: Joi.number().min(1).required(),
    employerId: Joi.string().length(24).hex().required(),
  }),
  getContractDETAILS: Joi.object().keys({
    contractId: Joi.string().length(24).hex().required(),
  }),
  contractACTIVATE: Joi.object().keys({
    contractId: Joi.string().length(24).hex().required(),
    freelancerId: Joi.string().length(24).hex().required(),
    employerId: Joi.string().length(24).hex().required(),
    token: Joi.any(),
    fixedBidAmount: Joi.object()
      .keys({
        currencyCode: Joi.string().required(),
        amount: Joi.number().greater(0).required(),
      })
      .required(),
  }),
  contractCLOSE: Joi.object().keys({
    contractId: Joi.string().length(24).hex().required(),
    employerId: Joi.string().length(24).hex().required(),
    jobId: Joi.string().length(24).hex().required(),
    freelancerId: Joi.string().length(24).hex().required(),
  }),
};

export default schemas;
