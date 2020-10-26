import ApiError from "./ApiError";
import writeServerResponse from "../utils/utils";

function apiErrorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    writeServerResponse(
      res,
      { error: err.message },
      err.code,
      "application/json"
    );
  }
  writeServerResponse(
    res,
    { error: "Something went wrong." },
    500,
    "application/json"
  );
}

export default apiErrorHandler;
