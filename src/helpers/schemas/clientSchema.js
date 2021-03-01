import Joi from "joi";

const schemas = {
  clientCREATE: Joi.object().keys({
    firstName: Joi.string().min(2).max(32).required(),
    lastName: Joi.string().min(2).max(32).required(),
    company: Joi.object()
      .keys({
        name: Joi.string().min(2).max(32).required(),
        website: Joi.string().min(10).max(32),
        tagline: Joi.string().min(2).max(32),
        description: Joi.string().min(5).max(200),
      })
      .required(),
    avatar: Joi.string().required(),
    phone: Joi.object()
      .keys({
        phoneNumber: Joi.string().required(),
      })
      .required(),
    location: Joi.object()
      .keys({
        country: Joi.string().min(4).max(32).required(),
        street: Joi.string().min(5).max(70),
        city: Joi.string().min(5).max(70),
        zip: Joi.number().integer(),
      })
      .required(),
  }),
  clientLIST: Joi.object().keys({
    page: Joi.number().min(0).required(),
    clientsPerPage: Joi.number().min(1).required(),
  }),
  clientDETAILS: Joi.object().keys({
    clientId: Joi.string().length(24).hex().required(),
  }),
  clientUPDATE: Joi.object().keys({
    firstName: Joi.string().min(2).max(32),
    lastName: Joi.string().min(2).max(32),
    company: Joi.object().keys({
      name: Joi.string().min(2).max(32).required(),
      website: Joi.string().min(10).max(32),
      tagline: Joi.string().min(2).max(32),
      description: Joi.string().min(5).max(200),
    }),
    phone: Joi.object().keys({
      phoneNumber: Joi.string().required(),
    }),
    location: Joi.object().keys({
      country: Joi.string().min(4).max(32).required(),
      street: Joi.string().min(5).max(70),
      city: Joi.string().min(5).max(70),
      zip: Joi.number().integer(),
    }),
  }),
  avatarUPLOAD: Joi.object().keys({
    clientId: Joi.string().length(24).hex().required(),
  }),
  phoneNumberVERIFY: Joi.object().keys({
    phoneNumber: Joi.string().required(),
  }),
  phoneNumberCONFIRM: Joi.object().keys({
    token: Joi.string().required(),
    id: Joi.string().required(),
    clientId: Joi.string().length(24).hex().required(),
  }),
};

export default schemas;
