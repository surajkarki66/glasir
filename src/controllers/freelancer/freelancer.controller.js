import ApiError from "../../error/ApiError";

export async function makeProfile(req, res, next) {
  try {
    const profileInfo = req.body;
    console.log(profileInfo);
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
