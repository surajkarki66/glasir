import ApiError from "./ApiError";
import { writeServerResponse } from "../helpers/response";

const apiErrorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return writeServerResponse(
      res,
      { status: "failed", data: { error: err.message } },
      err.code,
      "application/json",
    );
  }
  return writeServerResponse(
    res,
    { status: "failed", data: { error: "Something went wrong." } },
    500,
    "application/json",
  );
};

export default apiErrorHandler;
