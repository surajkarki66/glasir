import Joi from "joi";

const schemas = {
  userSIGNUP: Joi.object().keys({
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
    token: Joi.string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
      .required(),
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
    refreshToken: Joi.string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
      .required(),
  }),
  userLOGOUT: Joi.object().keys({
    refreshToken: Joi.string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
      .required(),
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
    token: Joi.string()
      .pattern(new RegExp("^[A-Za-z0-9-_]+.[A-Za-z0-9-_]+.[A-Za-z0-9-_.+/=]*$"))
      .required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  }),
  userDetailsCHANGE: Joi.object().keys({
    username: Joi.string().min(4).max(32),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: {
        allow: ["com", "net"],
      },
    }),
  }),
  emailCHANGE: Joi.object().keys({
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
