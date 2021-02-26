import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";
import { writeServerResponse } from "../helpers/response";

export async function me(req, res, next) {
  try {
    const { aud, role } = req.jwt;
    const { success, data, statusCode } =
      role === "freelancer" ? await DAOs.freelancersDAO.me(aud) : null;
    if (success) {
      const serverResponse = {
        status: "success",
        isAuthenticated: true,
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
      status: "false",
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
