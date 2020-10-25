import ApiError from "../error/ApiError";

const dataValidation = (schema, property) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req[property]);
      next();
    } catch (err) {
      const { details } = err;
      const message = details.map((i) => i.message).join(",");
      next(ApiError.unprocessable(message));
      return;
    }
  };
};

export default dataValidation;
