import Joi from "joi";

const schemas = {
  userSIGNUP: Joi.object().keys({
    username: Joi.string().min(4).max(20).required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: {
          allow: ["com", "net"],
        },
      })
      .required(),
    firstName: Joi.string().min(2).max(20).required(),
    lastName: Joi.string().min(2).max(20).required(),
    role: Joi.string().valid("freelancer", "client", "admin").required(),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  }),
  userACTIVATION: Joi.object().keys({
    token: [Joi.string().required(), Joi.number().required()],
  }),
  userACTIVATIONEMAIL: Joi.object().keys({
    id: Joi.string().required(),
  }),
  userLOGIN: Joi.object()
    .keys({
      username: Joi.string().min(4).max(20),
      email: Joi.string().email({
        minDomainSegments: 2,
        tlds: {
          allow: ["com", "net"],
        },
      }),
      password: Joi.string()
        .min(8)
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
    })
    .xor("email", "username"),
};
export default schemas;
