import { ObjectId } from "mongodb";
import parsePhoneNumber from "libphonenumber-js";

import DAOs from "../dao/index";
import messageBird from "../configs/messageBird";
import ApiError from "../errors/ApiError";
import { writeServerResponse } from "../helpers/response";

async function createEmployerProfile(req, res, next) {
  try {
    const employerInfo = req.body;
    const { aud } = req.jwt;
    const { phone } = employerInfo;

    const phoneNumber = parsePhoneNumber(phone.phoneNumber);
    if (phoneNumber && phoneNumber.isValid()) {
      const info = {
        ...employerInfo,
        user: ObjectId(aud),
        phone: { ...phone, isVerified: false },
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (await DAOs.employersDAO.getEmployerByPhone(phone.phoneNumber)) {
        next(ApiError.conflict("Phone number is already used."));
        return;
      }
      const { success, data, statusCode } =
        await DAOs.employersDAO.createEmployer(info);
      if (success) {
        const serverResponse = {
          status: "success",
          data: { message: "Profile is created successfully." },
        };
        return writeServerResponse(
          res,
          serverResponse,
          statusCode,
          "application/json",
        );
      }
      return writeServerResponse(
        res,
        { status: "failed", data: data },
        statusCode,
        "application/json",
      );
    }
    next(ApiError.badRequest("Invalid phone number."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function getEmployers(req, res, next) {
  try {
    const { page, employersPerPage } = req.query;
    const { success, data, statusCode, totalNumEmployers } =
      await DAOs.employersDAO.getEmployers({
        page,
        employersPerPage,
      });
    if (success) {
      const serverResponse = {
        status: "success",
        data: data,
        page: Number(page),
        filters: {},
        entries_per_page: Number(employersPerPage),
        totalResults: totalNumEmployers,
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    }
    next(ApiError.notFound("Not found"));
    return;
  } catch (e) {
    next(ApiError.internal(`Something went wrong: ${e.message}`));
    return;
  }
}
async function getEmployerDetails(req, res, next) {
  try {
    const { employerId } = req.params;
    const { success, data, statusCode } =
      await DAOs.employersDAO.getEmployerById(employerId);
    if (success) {
      const serverResponse = {
        status: "success",
        data: data,
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    } else {
      next(ApiError.notfound("Employer doesn't exist."));
      return;
    }
  } catch (error) {
    next(ApiError.internal("Something went wrong: ", error.messages));
    return;
  }
}

async function changeEmployerDetails(req, res, next) {
  try {
    const { employerId } = req.params;
    const { phone } = req.body;
    let employerDetails = {
      ...req.body,
      isVerified: false,
      updatedAt: new Date(),
    };
    if (phone) {
      employerDetails = {
        ...req.body,
        isVerified: false,
        phone: { ...phone, isVerified: false },
        updatedAt: new Date(),
      };
    }
    const { success, data, statusCode } =
      await DAOs.employersDAO.updateEmployer(employerId, employerDetails);
    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: "Updated successfully." },
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    } else {
      next(ApiError.notfound(data.error));
      return;
    }
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function uploadEmployerAvatar(req, res, next) {
  try {
    const file = req.file;
    if (!file) {
      next(ApiError.badRequest("No image selected."));
      return;
    }
    const { employerId } = req.params;
    const updateObject = { avatar: file.filename, updatedAt: new Date() };
    const { success, data, statusCode } =
      await DAOs.employersDAO.updateEmployer(employerId, updateObject);
    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: "Avatar uploaded successfully." },
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    } else {
      next(ApiError.notfound(data.error));
      return;
    }
  } catch (error) {
    console.error(error);
    next(ApiError.internal(`Something went wrong. ${error.message}`));
    return;
  }
}

async function verifyEmployerPhoneNumber(req, res, next) {
  try {
    const { phoneNumber } = req.body;
    const params = {
      originator: "Glasir",
      type: "sms",
    };
    messageBird.verify.create(phoneNumber, params, function (err, response) {
      if (err) {
        const { statusCode } = err;
        if (statusCode === 422) {
          next(ApiError.unprocessable("Invalid phone number."));
          return;
        }
        next(ApiError.internal(`Something went wrong: ${err.message}`));
        return;
      }

      const serverResponse = {
        status: "success",
        data: { message: "Verification code sent.", id: response.id },
      };
      return writeServerResponse(res, serverResponse, 200, "application/json");
    });
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function confirmEmployerPhoneNumber(req, res, next) {
  try {
    const { id, token, employerId } = req.body;
    messageBird.verify.verify(id, token, function (err, response) {
      if (err) {
        const { statusCode } = err;
        if (statusCode === 422) {
          next(ApiError.unprocessable("The verification code is expired."));
          return;
        }
        if (statusCode === 404) {
          next(ApiError.notFound("The verification id is not found."));
          return;
        }
        next(ApiError.internal(`Something went wrong`));
        return;
      }
      const updateObject = { "phone.isVerified": true, updatedAt: new Date() };
      DAOs.employersDAO
        .updateEmployer(employerId, updateObject)
        .then((response) => {
          const { success, statusCode, data } = response;
          if (success) {
            const serverResponse = {
              status: "success",
              data: { message: "Phone number is verified." },
            };
            return writeServerResponse(
              res,
              serverResponse,
              statusCode,
              "application/json",
            );
          }
          next(ApiError.notfound(data.error));
          return;
        });
    });
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function rateEmployer(req, res, next) {
  try {
    const { freelancerId, ratingScore, employerId } = req.body;
    const rateObj = {
      freelancer: ObjectId(freelancerId),
      ratingScore: ratingScore,
    };
    const { data, success, statusCode } = await DAOs.employersDAO.pushRate(
      employerId,
      rateObj,
    );
    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: "Rated successfully." },
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    } else {
      next(ApiError.notfound(data.error));
      return;
    }
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
async function isRated(req, res, next) {
  try {
    const { freelancerId, employerId } = req.query;
    const { data, success, statusCode } = await DAOs.employersDAO.isRated(
      employerId,
      freelancerId,
    );
    if (success) {
      const serverResponse = {
        status: "success",
        data: data,
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    } else {
      const serverResponse = {
        status: "success",
        data: data,
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    }
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function unRateEmployer(req, res, next) {
  try {
    const { employerId, freelancerId } = req.body;
    const { success, statusCode, data } = await DAOs.employersDAO.pullRate(
      employerId,
      freelancerId,
    );
    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: "Unrated successfully." },
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    } else {
      next(ApiError.notfound(data.error));
      return;
    }
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
export default {
  createEmployerProfile,
  getEmployers,
  getEmployerDetails,
  changeEmployerDetails,
  uploadEmployerAvatar,
  verifyEmployerPhoneNumber,
  confirmEmployerPhoneNumber,
  rateEmployer,
  isRated,
  unRateEmployer,
};
