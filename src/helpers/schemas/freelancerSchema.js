import Joi from "joi";

const schemas = {
  createProfile: Joi.object().keys({
    user: Joi.string().required(),
    expertise: Joi.object()
      .keys({
        service: Joi.string()
          .valid(
            "Design & Creative",
            "Engineering & Architecture",
            "IT & Networking",
            "Web, Mobile & Software Dev",
            "Writing"
          )
          .required(),
        serviceType: Joi.array().items(Joi.string()).length(4).required(),
        skills: Joi.array().items(Joi.string()).length(9).required(),
        expertiseLevel: Joi.string()
          .valid("Entry level", "Intermediate", "Expert")
          .required(),
      })
      .required(),
    education: Joi.array()
      .items(
        Joi.object.keys({
          school: Joi.string().length(50).required(),
          areaOfStudy: Joi.string(30),
          degree: Joi.string().length(30),
          datesAttended: Joi.object().keys({
            from: Joi.date().iso().required(),
            to: Joi.date().iso().greater(Joi.ref("from")).required(),
          }),
          description: Joi.string().length(50),
        })
      )
      .length(4),
    employement: Joi.array()
      .items(
        Joi.object().keys({
          company: Joi.string().length(30).required(),
          location: Joi.object()
            .keys({
              country: Joi.string().length(15).required(),
              city: Joi.string().length(15).required(),
            })
            .required(),
          title: Joi.string().length(10).required(),
          period: Joi.object()
            .keys({
              from: Joi.date().iso().required(),
              to: Joi.date().iso().greater(Joi.ref("from")),
            })
            .required(),
          description: Joi.string().length(50),
        })
      )
      .length(10),
    languages: Joi.array()
      .items(
        Joi.object().keys({
          name: Joi.string().length(10).required(),
          proficiency: Joi.string()
            .valid("Basic", "Conversational", "Fluent", "Native or Bilingual")
            .required(),
        })
      )
      .length(10)
      .required(),
    hourlyRate: Joi.number().greater(0).required(),
    title: Joi.string().length(10).required(),
    overview: Joi.string().length(20).required(),
    profilePic: Joi.string(),
    location: Joi.object()
      .keys({
        country: Joi.string().default("Nepal"),
        street: Joi.string().length(20).required(),
        city: Joi.string().length(20).required(),
        zip: Joi.number().required(),
        province: Joi.string()
          .valid(
            "Province No. 1",
            "Province No. 2",
            "Bagmati Province",
            "Gandaki Province",
            "Lumbini Province",
            "Karnali Province",
            "Sudurpashchim Province"
          )
          .required(),
      })
      .required(),
    phone: Joi.number().required(),
    citizenship: Joi.string().required(),
    cv: Joi.string().required(),
    isVerified: Joi.boolean().default(false).required(),
  }),
};
export default schemas;
