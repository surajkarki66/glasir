import Joi from "joi";

const schemas = {
  commonME: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
};
export default schemas;
