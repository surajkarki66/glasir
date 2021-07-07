import Joi from "joi";

const schemas = {
  employerCREATE: Joi.object().keys({
    firstName: Joi.string().min(2).max(32).required(),
    lastName: Joi.string().min(2).max(32).required(),
    company: Joi.object()
      .keys({
        name: Joi.string().min(2).max(32).required(),
        website: Joi.string().min(10).max(32).default(null),
        tagline: Joi.string().min(2).max(32).default(null),
        description: Joi.string().min(5).max(200).required(),
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
        street: Joi.string().min(5).max(70).required(),
        city: Joi.string().min(5).max(70).required(),
        zip: Joi.number().integer().default(null),
      })
      .required(),
    totalMoneySpent: Joi.object()
      .keys({
        currencyCode: Joi.string().valid("USD").default("USD"),
        amount: Joi.number().default(0),
      })
      .default({
        currencyCode: "USD",
        amount: 0,
      }),
    payment: Joi.object()
      .keys({
        method: Joi.string().valid("paypal", "creditCard", null).required(),
        isVerified: Joi.boolean().default(false),
      })
      .default({
        method: null,
        isVerified: false,
      }),
  }),
  employerLIST: Joi.object().keys({
    page: Joi.number().min(0).required(),
    employersPerPage: Joi.number().min(1).required(),
  }),
  employerDETAILS: Joi.object().keys({
    employerId: Joi.string().length(24).hex().required(),
  }),
  employerUPDATE: Joi.object().keys({
    firstName: Joi.string().min(2).max(32),
    lastName: Joi.string().min(2).max(32),
    company: Joi.object().keys({
      name: Joi.string().min(2).max(32).required(),
      website: Joi.string().min(10).max(32).required(),
      tagline: Joi.string().min(2).max(32).required(),
      description: Joi.string().min(5).max(200).required(),
    }),
    phone: Joi.object().keys({
      phoneNumber: Joi.string().required(),
    }),
    location: Joi.object().keys({
      country: Joi.string().min(4).max(32).required(),
      street: Joi.string().min(5).max(70).required(),
      city: Joi.string().min(5).max(70).required(),
      zip: Joi.number().integer().required(),
    }),
    payment: Joi.object().keys({
      method: Joi.string().valid("paypal", "creditCard", null).required(),
      isVerified: Joi.boolean().default(false),
    }),
  }),
  avatarUPLOAD: Joi.object().keys({
    employerId: Joi.string().length(24).hex().required(),
  }),
  phoneNumberVERIFY: Joi.object().keys({
    phoneNumber: Joi.string().required(),
  }),
  phoneNumberCONFIRM: Joi.object().keys({
    token: Joi.string().required(),
    id: Joi.string().required(),
    employerId: Joi.string().length(24).hex().required(),
  }),
  rateEmployer: Joi.object().keys({
    employerId: Joi.string().length(24).hex().required(),
    freelancerId: Joi.string().length(24).hex().required(),
    ratingScore: Joi.number().valid(1, 2, 3, 4, 5).required(),
  }),
  isRated: Joi.object().keys({
    employerId: Joi.string().length(24).hex().required(),
    freelancerId: Joi.string().length(24).hex().required(),
  }),
};

export default schemas;
