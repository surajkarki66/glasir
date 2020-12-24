import Joi from "joi";

const schemas = {
  userSIGNUP: Joi.object().keys({
    // firstName: Joi.string().min(2).max(32).required(),
    // lastName: Joi.string().min(2).max(32).required(),
    username: Joi.string().min(4).max(32).required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: {
          allow: ["com", "net"],
        },
      })
      .required(),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
    role: Joi.string().valid("freelancer", "client", "admin").required(),
  }),
  userACTIVATION: Joi.object().keys({
    token: [Joi.string().required(), Joi.number().required()],
  }),
  userACTIVATIONEMAIL: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
  userLOGIN: Joi.object()
    .keys({
      username: Joi.string().min(4).max(32),
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
  refreshTOKEN: Joi.object().keys({
    refreshToken: [Joi.string().required(), Joi.number().required()],
  }),
  userLOGOUT: Joi.object().keys({
    refreshToken: [Joi.string().required(), Joi.number().required()],
  }),
  userDELETE: Joi.object().keys({
    password: Joi.string()
      .min(8)
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  }),
  userLIST: Joi.object().keys({
    page: Joi.number().min(0).required(),
    usersPerPage: Joi.number().min(1).required(),
  }),
  userDETAILS: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
  passwordCHANGE: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
    oldPassword: Joi.string()
      .min(8)
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  }),
  passwordFORGOT: Joi.object().keys({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: {
          allow: ["com", "net"],
        },
      })
      .required(),
  }),
  passwordRESET: Joi.object().keys({
    token: [Joi.string().required(), Joi.number().required()],
    newPassword: Joi.string()
      .min(8)
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  }),
  userDetailsCHANGE: Joi.object().keys({
    // firstName: Joi.string().min(2).max(32),
    // lastName: Joi.string().min(2).max(32),
    username: Joi.string().min(4).max(32).required(),
  }),
  emailCHANGE: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: {
          allow: ["com", "net"],
        },
      })
      .required(),
  }),
};
export default schemas;
