import Joi from "joi";

const schemas = {
  saveJobCREATE: Joi.object().keys({
    jobId: Joi.string().length(24).hex().required(),
    createdAt: Joi.date().default(new Date()),
    updatedAt: Joi.date().default(new Date()),
  }),
  saveJobDELETE: Joi.object().keys({
    jobId: Joi.string().length(24).hex().required(),
  }),
  saveJobSAVED: Joi.object().keys({
    jobId: Joi.string().length(24).hex().required(),
  }),
  savedJobsLIST: Joi.object().keys({
    page: Joi.number().min(0).required(),
    jobsPerPage: Joi.number().min(1).required(),
  }),
};

export default schemas;
