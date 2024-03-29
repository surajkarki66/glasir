import Joi from "joi";

const schemas = {
  freelancerCREATE: Joi.object().keys({
    firstName: Joi.string().min(2).max(32).required(),
    lastName: Joi.string().min(2).max(32).required(),
    title: Joi.string().min(10).max(70).required(),
    avatar: Joi.string().default(null),
    overview: Joi.string().min(10).max(5000).required(),
    hourlyRate: Joi.object()
      .keys({
        currencyCode: Joi.string().valid("USD").default("USD"),
        amount: Joi.number().greater(0).required(),
      })
      .required(),
    totalMoneyEarned: Joi.object()
      .keys({
        currencyCode: Joi.string().valid("USD").default("USD"),
        amount: Joi.number().default(0),
      })
      .default({
        currencyCode: "USD",
        amount: 0,
      }),
    jobsWorkedIn: Joi.array().items(Joi.string()).default([]),
    currentBalance: Joi.object()
      .keys({
        currencyCode: Joi.string().valid("USD").default("USD"),
        amount: Joi.number().default(0),
      })
      .default({
        currencyCode: "USD",
        amount: 0,
      }),
    ratings: Joi.array().default([]),
    location: Joi.object()
      .keys({
        country: Joi.string().required(),
        street: Joi.string().min(5).max(70).required(),
        city: Joi.string().min(5).max(70).required(),
        zip: Joi.number().integer().required(),
        province: Joi.string()
         // .valid(
         //  "Province No. 1",
         //   "Province No. 2",
         //   "Bagmati Province",
         //   "Gandaki Province",
         //   "Lumbini Province",
         //   "Karnali Province",
         //   "Sudurpashchim",
         // )
          .required(),
      })
      .required(),
    phone: Joi.object()
      .keys({
        phoneNumber: Joi.string().required(),
      })
      .required(),
    citizenship: Joi.string().default(null),
    resume: Joi.string().default(null),
    expertise: Joi.object()
      .keys({
        service: Joi.string()
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

    education: Joi.object()
      .keys({
        school: Joi.string().min(5).max(200).required(),
        areaOfStudy: Joi.string().min(2).max(70).required(),
        degree: Joi.string().min(5).max(100).required(),
        datesAttended: Joi.object()
          .keys({
            from: Joi.date().iso().required(),
            to: Joi.date().iso().greater(Joi.ref("from")).required(),
          })
          .required(),
        description: Joi.string().min(5).max(200),
      })
      .default({}),

    employments: Joi.array()
      .items(
        Joi.object().keys({
          company: Joi.string().min(2).max(200).required(),
          location: Joi.object()
            .keys({
              country: Joi.string().min(2).max(70).required(),
              city: Joi.string().min(5).max(70).required(),
            })
            .required(),
          title: Joi.string().min(5).max(70).required(),
          period: Joi.object()
            .keys({
              from: Joi.date().iso().required(),
              to: Joi.date().iso().greater(Joi.ref("from")),
            })
            .required(),
          description: Joi.string().min(5).max(255),
        }),
      )
      .max(10)
      .default([]),

    englishLanguage: Joi.object()
      .keys({
        proficiency: Joi.string()
          .valid("Basic", "Conversational", "Fluent", "Native Or Bilingual")
          .required(),
      })
      .required(),
  }),

  freelancerLIST: Joi.object().keys({
    page: Joi.number().min(1).required(),
    freelancersPerPage: Joi.number().min(1).required(),
  }),

  freelancerSEARCH: Joi.object().keys({
    text: Joi.string().allow("").required(),
    service: Joi.string()
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
    province: Joi.string()
      .valid(
        "Province No. 1",
        "Province No. 2",
        "Bagmati Province",
        "Gandaki Province",
        "Lumbini Province",
        "Karnali Province",
        "Sudurpashchim",
        "",
      )
      .required(),
    englishProficiency: Joi.string().allow("").required(),
    page: Joi.number().min(1).required(),
    freelancersPerPage: Joi.number().min(1).required(),
  }),

  freelancerDETAILS: Joi.object().keys({
    freelancerId: Joi.string().length(24).hex().required(),
  }),
  avatarUPLOAD: Joi.object().keys({
    freelancerId: Joi.string().length(24).hex().required(),
  }),
  documentUPLOAD: Joi.object().keys({
    freelancerId: Joi.string().length(24).hex().required(),
  }),
  freelancerUPDATE: Joi.object().keys({
    firstName: Joi.string().min(2).max(32),
    lastName: Joi.string().min(2).max(32),
    title: Joi.string().min(10).max(70),
    overview: Joi.string().min(10).max(5000),
    hourlyRate: Joi.object().keys({
      currencyCode: Joi.string().valid("USD").default("USD"),
      amount: Joi.number().greater(0).required(),
    }),
    location: Joi.object().keys({
      country: Joi.string().valid("Nepal").required(),
      street: Joi.string().min(5).max(70).required(),
      city: Joi.string().min(5).max(70).required(),
      zip: Joi.number().integer().required(),
      province: Joi.string()
        .valid(
          "Province No. 1",
          "Province No. 2",
          "Bagmati Province",
          "Gandaki Province",
          "Lumbini Province",
          "Karnali Province",
          "Sudurpashchim",
        )
        .required(),
    }),
    phone: Joi.object().keys({
      phoneNumber: Joi.string().required(),
    }),
    expertise: Joi.object().keys({
      service: Joi.string()
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
      skills: Joi.array()
        .items(Joi.string().min(2).max(200))
        .min(1)
        .max(9)
        .required(),
      expertiseLevel: Joi.string()
        .valid("Beginner", "Intermediate", "Expert")
        .required(),
    }),
    education: Joi.object().keys({
      school: Joi.string().min(5).max(200).required(),
      areaOfStudy: Joi.string().min(2).max(70).required(),
      degree: Joi.string().min(5).max(100).required(),
      datesAttended: Joi.object()
        .keys({
          from: Joi.date().iso().required(),
          to: Joi.date().iso().greater(Joi.ref("from")).required(),
        })
        .required(),
      description: Joi.string().min(5).max(200).required(),
    }),

    englishLanguage: Joi.object().keys({
      proficiency: Joi.string()
        .valid("Basic", "Conversational", "Fluent", "Native Or Bilingual")
        .required(),
    }),
  }),

  employmentCREATE: Joi.object().keys({
    freelancerId: Joi.string().length(24).hex().required(),
    company: Joi.string().min(2).max(200).required(),
    location: Joi.object()
      .keys({
        country: Joi.string().min(2).max(70).required(),
        city: Joi.string().min(5).max(70).required(),
      })
      .required(),
    title: Joi.string().min(5).max(70).required(),
    period: Joi.object()
      .keys({
        from: Joi.date().iso().required(),
        to: Joi.date().iso().greater(Joi.ref("from")),
      })
      .required(),
    description: Joi.string().min(5).max(255),
  }),
  employmentUPDATE: Joi.object().keys({
    companyName: Joi.string().min(2).max(200).required(),
    newEmployment: Joi.object().keys({
      company: Joi.string().min(2).max(200).required(),
      location: Joi.object()
        .keys({
          country: Joi.string().min(2).max(70).required(),
          city: Joi.string().min(5).max(70).required(),
        })
        .required(),
      title: Joi.string().min(5).max(70).required(),
      period: Joi.object()
        .keys({
          from: Joi.date().iso().required(),
          to: Joi.date().iso().greater(Joi.ref("from")),
        })
        .required(),
      description: Joi.string().min(5).max(255),
    }),
  }),
  phoneNumberVERIFY: Joi.object().keys({
    phoneNumber: Joi.string().required(),
  }),
  phoneNumberCONFIRM: Joi.object().keys({
    token: Joi.string().required(),
    id: Joi.string().required(),
    freelancerId: Joi.string().length(24).hex().required(),
  }),
  incrementJobsWorkedIn: Joi.object().keys({
    jobId: Joi.string().length(24).hex().required(),
  }),
  rateFreelancer: Joi.object().keys({
    employerId: Joi.string().length(24).hex().required(),
    freelancerId: Joi.string().length(24).hex().required(),
    ratingScore: Joi.number().valid(1, 2, 3, 4, 5).required(),
  }),
  isRated: Joi.object().keys({
    employerId: Joi.string().length(24).hex().required(),
    freelancerId: Joi.string().length(24).hex().required(),
  }),
  unrateFreelancer: Joi.object().keys({
    employerId: Joi.string().length(24).hex().required(),
    freelancerId: Joi.string().length(24).hex().required(),
  }),
};
export default schemas;
