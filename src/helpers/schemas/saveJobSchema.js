import Joi from "joi";

const schemas = {
  saveJobCREATE: Joi.object().keys({
    freelancerId: Joi.string().length(24).hex().required(),
    jobId: Joi.string().length(24).hex().required(),
  }),
  saveJobDELETE: Joi.object().keys({
    freelancerId: Joi.string().length(24).hex().required(),
    jobId: Joi.string().length(24).hex().required(),
  }),
  isJobSAVED: Joi.object().keys({
    freelancerId: Joi.string().length(24).hex().required(),
    jobId: Joi.string().length(24).hex().required(),
  }),
  savedJobsLIST: Joi.object().keys({
    freelancerId: Joi.string().length(24).hex().required(),
    page: Joi.number().min(1).required(),
    jobsPerPage: Joi.number().min(1).required(),
  }),
};

export default schemas;
