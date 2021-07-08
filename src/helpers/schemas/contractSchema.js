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
};

export default schemas;
