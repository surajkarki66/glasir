import { ObjectId } from "bson";
import parsePhoneNumber from "libphonenumber-js";

import DAOs from "../dao/index";
import ApiError from "../error/ApiError";
import { writeServerResponse } from "../helpers/response";

export async function makeProfile(req, res, next) {
  try {
    const profileInfo = req.body;
    const { aud } = req.jwt;
    const { phone } = profileInfo;

    const phoneNumber = parsePhoneNumber(phone.phoneNumber);
    if (phoneNumber && phoneNumber.isValid()) {
      const newHourlyRate =
        profileInfo.hourlyRate - process.env.RATE * profileInfo.hourlyRate;
      const info = {
        ...profileInfo,
        user: ObjectId(aud),
        hourlyRate: newHourlyRate,
      };

      if (await DAOs.freelancersDAO.getFreelancerByPhone(phone.phoneNumber)) {
        next(ApiError.conflict("Phone number is already used."));
        return;
      }
      const result = await DAOs.freelancersDAO.createProfile(info);
      if (result.success) {
        const data = {
          status: "success",
          data: { message: "Profile is created successfully." },
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
    }
    next(ApiError.unprocessable("Invalid phone number."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
export async function getFreelancers(req, res, next) {
  const { page, freelancersPerPage } = req.query;
}
