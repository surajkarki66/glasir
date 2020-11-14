import ApiError from "../../error/ApiError";

export async function makeProfile(req, res, next) {
  try {
    const profileInfo = req.body;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
