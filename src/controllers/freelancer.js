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
        profileInfo.hourlyRate -
        process.env.SERVICE_FEE_RATE * profileInfo.hourlyRate;
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
        const response = {
          status: "success",
          data: { message: "Profile is created successfully." },
        };
        return writeServerResponse(
          res,
          response,
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
    next(ApiError.badRequest("Invalid phone number."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
export async function uploadDocument(req, res, next) {
  try {
    if (!req.files) {
      next(ApiError.badRequest("No file selected."));
      return;
    }
    let updateObject = { updatedAt: new Date() };
    const { citizenship, resume } = req.files;
    const { id } = req.params;

    if (citizenship && resume) {
      updateObject = {
        citizenship: citizenship[0].filename,
        resume: resume[0].filename,
        ...updateObject,
      };
    }
    if (citizenship) {
      updateObject = {
        citizenship: citizenship[0].filename,
        ...updateObject,
      };
    }
    if (resume) {
      updateObject = {
        resume: resume[0].filename,
        ...updateObject,
      };
    }

    const result = await DAOs.freelancersDAO.updateFreelancer(id, updateObject);
    if (result.success) {
      const response = {
        status: "success",
        data: { message: " Uploaded successfully." },
      };
      return writeServerResponse(
        res,
        response,
        result.statusCode,
        "application/json"
      );
    } else {
      next(ApiError.notfound(freelancer.data.error));
      return;
    }
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
export async function getFreelancers(req, res, next) {
  try {
    const { page, freelancersPerPage } = req.query;
    const result = await DAOs.freelancersDAO.getFreelancers({
      page,
      freelancersPerPage,
    });
    if (result.success) {
      const { data, totalNumFreelancers, statusCode } = result;
      const response = {
        status: "success",
        freelancers: data,
        page: parseInt(page),
        filters: {},
        entriesPerPage: parseInt(freelancersPerPage),
        totalResults: totalNumFreelancers,
      };
      return writeServerResponse(res, response, statusCode, "application/json");
    }
    next(ApiError.notfound("Freelancers are not found."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

export async function searchFreelancer(req, res, next) {
  try {
    let filters = {};
    const queryArry = Object.keys(req.query);
    const { page, freelancersPerPage } = req.query;

    queryArry.some((query) => {
      if (query === "page" || query === "freelancersPerPage") {
        return false;
      }
      if (req.query[query] !== "") {
        filters[query] = req.query[query];
      }
    });

    const result = await DAOs.freelancersDAO.getFreelancers({
      filters,
      page,
      freelancersPerPage,
    });
    const { success, data, totalNumFreelancers, statusCode } = result;
    if (success) {
      const response = {
        status: "success",
        freelancers: data,
        page: parseInt(page),
        filters: {},
        entriesPerPage: parseInt(freelancersPerPage),
        totalResults: totalNumFreelancers,
      };
      return writeServerResponse(res, response, statusCode, "application/json");
    }
    next(ApiError.notfound("Freelancers are not found."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

export async function getFreelancerDetails(req, res, next) {
  try {
    const id = req.params.freelancerId;
    const result = await DAOs.freelancersDAO.getFreelancerById(id);
    const { success, data, statusCode } = result;
    if (success) {
      const response = {
        status: "success",
        data: data,
      };
      return writeServerResponse(res, response, statusCode, "application/json");
    }
    next(ApiError.notfound("Freelancer doesnot exist."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
