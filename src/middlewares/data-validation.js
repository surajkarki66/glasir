import ApiError from "../error/ApiError";

export const dataValidation = (schema, property) => {
	return async (req, res, next) => {
		try {
			const value = await schema.validateAsync(req[property]);
			req[property] = value;
			next();
		} catch (err) {
			const { details } = err;
			const message = details.map((i) => i.message).join(",");
			next(ApiError.badRequest(message));
			return;
		}
	};
};
