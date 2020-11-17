import ApiError from "../error/ApiError";

export const dataValidation = (schema, property) => {
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

export const imageValidation = (req, res, next) => {
  const file = req.file;
  if (!file) {
    next(ApiError.unprocessable("No image selected."));
    return;
  }
  req.body = { avatar: file.filename };
  next();
};
