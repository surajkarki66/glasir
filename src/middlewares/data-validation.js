import writeServerResponse from "../utils/utils";

const dataValidation = (schema, property) => {
	return async (req, res, next) => {
		try {
			await schema.validateAsync(req[property]);
			next();
		} catch (err) {
			const {
				details
			} = err;
			const message = details.map((i) => i.message).join(",");
			writeServerResponse(res, {
				error: message
			}, 422, "application/json");

		}
	};
};

export default dataValidation;
