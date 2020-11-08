import ApiError from "./ApiError";
import writeServerResponse from "../helpers/response";

function apiErrorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return writeServerResponse(
      res,
      { status: "failed", error: err.message },
      err.code,
      "application/json"
    );
  }
  return writeServerResponse(
    res,
    { status: "failed", error: "Something went wrong." },
    500,
    "application/json"
  );
}

export default apiErrorHandler;
