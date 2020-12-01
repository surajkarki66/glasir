import Joi from "joi";

const schemas = {
  createProfile: Joi.object().keys({
    title: Joi.string().min(10).max(70).required(),
    overview: Joi.string().min(10).max(5000).required(),
    hourlyRate: Joi.number().greater(0).required(),
    location: Joi.object()
      .keys({
        country: Joi.string().valid("Nepal").required(),
        street: Joi.string().min(5).max(70).required(),
        city: Joi.string().min(5).max(70).required(),
        zip: Joi.number().integer().required(),
        province: Joi.string()
          .valid(
            "Province No.1",
            "Province No.2",
            "Bagmati Province",
            "Gandaki Province",
            "Lumbini Province",
            "Karnali Province",
            "Sudurpashchim Province"
          )
          .required(),
      })
      .required(),
    phone: Joi.object().keys({
      phoneNumber: Joi.string().required(),
      isVerified: Joi.boolean().default(false),
    }),
    citizenship: Joi.string(),
    resume: Joi.string(),
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
            "Writing"
          )
          .required(),
        serviceType: Joi.array()
          .items(Joi.string().min(2).max(200))
          .min(1)
          .max(4)
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
    education: Joi.array()
      .items(
        Joi.object().keys({
          school: Joi.string().min(5).max(200).required(),
          areaOfStudy: Joi.string().min(2).max(70),
          degree: Joi.string().min(5).max(100),
          datesAttended: Joi.object().keys({
            from: Joi.date().iso().required(),
            to: Joi.date().iso().greater(Joi.ref("from")).required(),
          }),
          description: Joi.string().min(5).max(200),
        })
      )

      .max(4),
    employement: Joi.array()
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
        })
      )

      .max(10),
    languages: Joi.array()
      .items(
        Joi.object().keys({
          name: Joi.string().min(5).max(255).required(),
          proficiency: Joi.string()
            .valid("Basic", "Conversational", "Fluent", "Native Or Bilingual")
            .required(),
        })
      )
      .max(10)
      .required(),

    isVerified: Joi.boolean().default(false),
    createdAt: Joi.date().iso().default(new Date()),
    updatedAt: Joi.date().iso().default(new Date()),
  }),
  freelancerLIST: Joi.object().keys({
    page: Joi.number().min(0).required(),
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
        ""
      )
      .required(),
    expertiseLevel: Joi.string()
      .valid("Beginner", "Intermediate", "Expert", "")
      .required(),
    province: Joi.string()
      .valid(
        "Province No.1",
        "Province No.2",
        "Bagmati Province",
        "Gandaki Province",
        "Lumbini Province",
        "Karnali Province",
        "Sudurpashchim Province",
        ""
      )
      .required(),
    englishProficiency: Joi.string().allow("").required(),
    page: Joi.number().min(0).required(),
    freelancersPerPage: Joi.number().min(1).required(),
  }),
  freelancerDETAILS: Joi.object().keys({
    freelancerId: Joi.string().length(24).hex().required(),
  }),
};
export default schemas;
