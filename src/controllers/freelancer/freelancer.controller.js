import DAOs from "../../dao/index";
import ApiError from "../../error/ApiError";
import writeServerResponse from "../../helpers/response";

export async function makeProfile(req, res, next) {
  try {
    const profileInfo = req.body;
    const { aud } = req.jwt;

    const user = await DAOs.usersDAO.getUserById(aud);
    if (user.success) {
      const info = {
        user: aud,
        ...profileInfo,
        createdAt: new Date(),
        updatedAt: null,
      };
      const result = await DAOs.freelancersDAO.createProfile(info);
      if (result.success) {
        const data = { message: "Your profile created successfully." };
        return writeServerResponse(
          res,
          data,
          result.statusCode,
          "application/json"
        );
      }
      next(ApiError.conflict(result.error));
      return;
    } else {
      next(ApiError.badRequest("No user exist with that user id."));
      return;
    }
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
export async function uploadAvatar(req, res, next) {
  const file = req.file;
  if (!file) {
    next(ApiError.unprocessable("Choose an image."));
    return;
  }
  const data = {
    status: "success",
    message: "Avatar uploaded successfully.",
    file: file.filename,
  };
  return writeServerResponse(res, data, 201, "application/json");
}
