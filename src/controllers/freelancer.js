import { ObjectId } from "bson";

import DAOs from "../dao/index";
import ApiError from "../error/ApiError";
import writeServerResponse from "../helpers/response";

export async function makeProfile(req, res, next) {
  try {
    const profileInfo = req.body;
    const { aud } = req.jwt;
    const info = {
      user: ObjectId(aud),
      ...profileInfo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await DAOs.freelancersDAO.createProfile(info);
    if (result.success) {
      const data = {
        status: "success",
        data: {
          message: "Your profile created successfully.",
        },
      };
      return writeServerResponse(
        res,
        data,
        result.statusCode,
        "application/json"
      );
    }
    return writeServerResponse(
      res,
      { status: "failed", data: result.data },
      result.statusCode,
      "application/json"
    );
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
export async function getFreelancers(req, res, next) {
  const FREELANCERS_PER_PAGE = 20;
  await DAOs.freelancersDAO.getMovies();
}
