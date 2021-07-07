import Joi from "joi";

const schemas = {
  hireCREATE: Joi.object().keys({
    freelancer: Joi.string().length(24).hex().required(),
    employer: Joi.string().length(24).hex().required(),
    job: Joi.string().length(24).hex().required(),
    contractTitle: Joi.string().min(3).max(50).required(),
    workDetails: Joi.string().required(),
    workDetailsFiles: Joi.string().default(null),
  }),
};

export default schemas;
