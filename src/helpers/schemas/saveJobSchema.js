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
};

export default schemas;
