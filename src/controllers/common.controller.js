import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";
import { writeServerResponse } from "../helpers/response";

async function me(req, res, next) {
  try {
    const { aud, role } = req.jwt;
    const { success, data, statusCode } =
      role === "freelancer"
        ? await DAOs.freelancersDAO.me(aud)
        : await DAOs.employersDAO.me(aud);
    if (success) {
      const serverResponse = {
        status: "success",
        hasProfile: true,
        isAuthenticated: true,
        role: role,
        data: data,
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    }
    const serverResponse = {
      status: "success",
      hasProfile: false,
      isAuthenticated: true,
      role: role,
      data: data,
    };
    return writeServerResponse(res, serverResponse, 200, "application/json");
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

export default { me };
