import Joi from "joi";

const schemas = {
  jobCREATE: Joi.object().keys({
    title: Joi.string().min(5).max(255).required(),
    employerId: Joi.string().length(24).hex().required(),
    description: Joi.string().min(50).max(5000).required(),
    jobStatus: Joi.string().default("opened").valid("opened", "closed"),
    projectLengthInHours: Joi.number().greater(0).required(),
    category: Joi.string()
      .valid(
        "Administration",
        "Design And Creative",
        "Engineering And Architecture",
        "IT And Networking",
        "Marketing",
        "Web,Mobile And Software Dev",
        "Writing",
      )
      .required(),
    projectType: Joi.string().valid("onetime", "ongoing").required(),
    expertise: Joi.object()
      .keys({
        skills: Joi.array()
          .items(Joi.string().min(2).max(200))
          .min(1)
          .max(9)
          .required(),
        expertiseLevel: Joi.string()
          .valid("Beginner", "Intermediate", "Expert")
          .required(),
      })
      .required(),
    pay: Joi.object()
      .keys({
        type: Joi.string().valid("fixed", "hourly").required(),
        price: Joi.object()
          .when("type", {
            is: "hourly",
            then: Joi.object()
              .keys({
                currencyCode: Joi.string().valid("USD").default("USD"),
                minRate: Joi.number().required(),
                maxRate: Joi.number().required(),
              })
              .required(),
            otherwise: Joi.object().keys({
              currencyCode: Joi.string().valid("USD").default("USD"),
              amount: Joi.number().required(),
            }),
          })
          .required(),
      })
      .required(),
    proposals: Joi.array().items(Joi.string().length(24).hex()).default([]),
    hired: Joi.array().items(Joi.string().length(24).hex()).default([]),
    createdAt: Joi.date().default(new Date()),
    updatedAt: Joi.date().default(new Date()),
  }),
  jobLIST: Joi.object().keys({
    page: Joi.number().min(0).required(),
    jobsPerPage: Joi.number().min(1).required(),
  }),
  jobSEARCH: Joi.object().keys({
    text: Joi.string().allow("").required(),
    category: Joi.string()
      .valid(
        "Administration",
        "Design And Creative",
        "Engineering And Architecture",
        "IT And Networking",
        "Marketing",
        "Web,Mobile And Software Dev",
        "Writing",
        "",
      )
      .required(),
    expertiseLevel: Joi.string()
      .valid("Beginner", "Intermediate", "Expert", "")
      .required(),
    projectType: Joi.string().valid("onetime", "ongoing", "").required(),
    payType: Joi.string().valid("fixed", "hourly", "").required(),
    page: Joi.number().min(0).required(),
    jobsPerPage: Joi.number().min(1).required(),
  }),
  jobDETAILS: Joi.object().keys({
    jobId: Joi.string().length(24).hex().required(),
  }),
  jobUPDATE: Joi.object().keys({
    title: Joi.string().min(5).max(255),
    description: Joi.string().min(50).max(5000),
    jobStatus: Joi.string().valid("opened", "closed"),
    projectLengthInHours: Joi.number().greater(0),
    projectType: Joi.string().valid("onetime", "ongoing"),
    expertise: Joi.object().keys({
      skills: Joi.array()
        .items(Joi.string().min(2).max(200))
        .min(1)
        .max(9)
        .required(),
      expertiseLevel: Joi.string()
        .valid("Beginner", "Intermediate", "Expert")
        .required(),
    }),
    pay: Joi.object().keys({
      type: Joi.string().valid("fixed", "hourly").required(),
      price: Joi.object()
        .when("type", {
          is: "hourly",
          then: Joi.object()
            .keys({
              currencyCode: Joi.string().valid("USD").default("USD"),
              minRate: Joi.number().required(),
              maxRate: Joi.number().required(),
            })
            .required(),
          otherwise: Joi.object().keys({
            currencyCode: Joi.string().valid("USD").default("USD"),
            amount: Joi.number().required(),
          }),
        })
        .required(),
    }),
    updatedAt: Joi.date().default(new Date()),
  }),
  jobDELETE: Joi.object().keys({
    jobId: Joi.string().length(24).hex().required(),
  }),
  getEmployerJOBS: Joi.object().keys({
    page: Joi.number().min(0).required(),
    jobsPerPage: Joi.number().min(1).required(),
    employerId: Joi.string().length(24).hex().required(),
    jobStatus: Joi.string().valid("opened", "closed"),
  }),
  hireFreelancer: Joi.object().keys({
    freelancerId: Joi.string().length(24).hex().required(),
    employerId: Joi.string().length(24).hex().required(),
    jobId: Joi.string().length(24).hex().required(),
    contractTitle: Joi.string().min(3).max(50).required(),
    workDetails: Joi.string().required(),
    bidType: Joi.string().valid("fixed", "hourly").required(),
    fixedBidAmount: Joi.number()
      .greater(0)
      .when("bidType", { is: "fixed", then: Joi.required() }),
    hourlyBidAmount: Joi.number()
      .greater(0)
      .when("bidType", { is: "hourly", then: Joi.required() }),
  }),
  isFreelancerHIRED: Joi.object().keys({
    freelancerId: Joi.string().length(24).hex().required(),
    jobId: Joi.string().length(24).hex().required(),
  }),
};

export default schemas;
