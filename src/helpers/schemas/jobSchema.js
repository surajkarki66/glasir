import Joi from "joi";

const schemas = {
  jobCREATE: Joi.object().keys({
    title: Joi.string().min(5).max(255).required(),
    description: Joi.string().min(50).max(5000).required(),
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
          .keys({
            total: Joi.number().required(),
          })
          .when("type", {
            is: "hourly",
            then: Joi.object()
              .keys({
                minRate: Joi.number().required(),
                maxRate: Joi.number().required,
              })
              .required(),
          })
          .required(),
      })
      .required(),
  }),
};

export default schemas;
