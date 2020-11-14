import DAOs from "../../dao/index";
import ApiError from "../../error/ApiError";

export async function makeProfile(req, res, next) {
  try {
    const profileInfo = req.body;
    const info = { ...profileInfo, createdAt: new Date(), updatedAt: null };
    const user = await DAOs.usersDAO.getById(info.user);

    const result = await DAOs.freelancersDAO.createProfile(info);
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
