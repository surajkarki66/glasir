import { ObjectId } from "mongodb";
import parsePhoneNumber from "libphonenumber-js";

import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";
import messageBird from "../configs/messageBird";
import { writeServerResponse } from "../helpers/response";

async function createFreelancerProfile(req, res, next) {
  try {
    const freelancerInfo = req.body;
    const { aud } = req.jwt;
    const { phone } = freelancerInfo;

    const phoneNumber = parsePhoneNumber(phone.phoneNumber);
    if (phoneNumber && phoneNumber.isValid()) {
      const info = {
        ...freelancerInfo,
        userId: ObjectId(aud),
        phone: { ...phone, isVerified: false },
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (await DAOs.freelancersDAO.getFreelancerByPhone(phone.phoneNumber)) {
        next(ApiError.conflict("Phone number is already used."));
        return;
      }
      const { success, data, statusCode } =
        await DAOs.freelancersDAO.createFreelancer(info);
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
async function uploadFreelancerAvatar(req, res, next) {
  try {
    const file = req.file;
    if (!file) {
      next(ApiError.badRequest("No image selected."));
      return;
    }
    const { freelancerId } = req.params;
    const updateObject = { avatar: file.filename, updatedAt: new Date() };
    const { success, data, statusCode } =
      await DAOs.freelancersDAO.updateFreelancer(freelancerId, updateObject);
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
    next(ApiError.internal(`Something went wrong. ${error.message}`));
    return;
  }
}
async function uploadDocument(req, res, next) {
  try {
    if (!req.files) {
      next(ApiError.badRequest("No file selected."));
      return;
    }
    let updateObject = { updatedAt: new Date() };
    const { citizenship, resume } = req.files;
    const { freelancerId } = req.params;

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

    const { success, data, statusCode } =
      await DAOs.freelancersDAO.updateFreelancer(freelancerId, updateObject);
    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: " Uploaded successfully." },
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
async function getFreelancers(req, res, next) {
  try {
    const { page, freelancersPerPage } = req.query;
    const {
      success,
      data,
      totalFreelancersCount,
      totalFreelancersCountInPage,
      statusCode,
    } = await DAOs.freelancersDAO.getFreelancers({
      page,
      freelancersPerPage,
    });
    if (success) {
      const serverResponse = {
        status: "success",
        freelancers: data,
        page: parseInt(page),
        entriesPerPage: parseInt(freelancersPerPage),
        totalResultsInPage: totalFreelancersCountInPage,
        totalResults: totalFreelancersCount,
        filters: filter,
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    }
    next(ApiError.notfound("Freelancers are not found."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function searchFreelancer(req, res, next) {
  try {
    let filters = {};
    const queryArray = Object.keys(req.query);
    const { page, freelancersPerPage } = req.query;

    queryArray.some((query) => {
      if (query === "page" || query === "freelancersPerPage") {
        return false;
      }
      if (req.query[query] !== "") {
        filters[query] = req.query[query];
      }
    });

    const {
      success,
      data,
      totalFreelancersCount,
      totalFreelancersCountInPage,
      statusCode,
    } = await DAOs.freelancersDAO.getFreelancers({
      filters,
      page,
      freelancersPerPage,
    });

    if (success) {
      const serverResponse = {
        status: "success",
        freelancers: data,
        page: parseInt(page),
        entriesPerPage: parseInt(freelancersPerPage),
        totalResultsInPage: totalFreelancersCountInPage,
        totalResults: totalFreelancersCount,
        filters: filters,
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    }
    next(ApiError.notfound("Freelancers are not found."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function getFreelancerDetails(req, res, next) {
  try {
    const { freelancerId } = req.params;
    const { success, data, statusCode } =
      await DAOs.freelancersDAO.getFreelancerById(freelancerId);

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
    }
    next(ApiError.notfound("Freelancer doesn't exist."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function changeFreelancerDetails(req, res, next) {
  try {
    const { freelancerId } = req.params;
    const { phone, hourlyRate } = req.body;
    let freelancerDetails = {
      ...req.body,
      isVerified: false,
      updatedAt: new Date(),
    };
    if (hourlyRate) {
      const newHourlyRate = {
        ...hourlyRate,
        amount: hourlyRate.amount,
      };
      freelancerDetails = {
        ...freelancerDetails,
        hourlyRate: newHourlyRate,
      };
    }
    if (phone) {
      freelancerDetails = {
        ...freelancerDetails,
        phone: { ...phone, isVerified: false },
      };
    }
    const { success, data, statusCode } =
      await DAOs.freelancersDAO.updateFreelancer(
        freelancerId,
        freelancerDetails,
      );
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

async function addEmployment(req, res, next) {
  try {
    const { freelancerId } = req.body;
    const employment = req.body;
    delete employment.freelancerId;

    const { success, data, statusCode } =
      await DAOs.freelancersDAO.addEmployment(freelancerId, employment);
    if (success) {
      const serverResponse = { status: "success", data: data };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    }
    next(ApiError.notfound(data.error));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function updateEmployment(req, res, next) {
  try {
    const { freelancerId } = req.params;
    const { companyName, newEmployment } = req.body;
    const { success, data, statusCode } =
      await DAOs.freelancersDAO.updateEmployment(
        freelancerId,
        companyName,
        newEmployment,
      );
    if (success) {
      const serverResponse = { status: "success", data: data };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    }
    next(ApiError.notfound(data.error));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function verifyFreelancerPhoneNumber(req, res, next) {
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

async function confirmFreelancerPhoneNumber(req, res, next) {
  try {
    const { id, token, freelancerId } = req.body;
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
      DAOs.freelancersDAO
        .updateFreelancer(freelancerId, updateObject)
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

async function rateFreelancer(req, res, next) {
  try {
    const { freelancerId, ratingScore, employerId } = req.body;
    const rateObj = {
      employerId: ObjectId(employerId),
      ratingScore: ratingScore,
    };
    const { data, success, statusCode } = await DAOs.freelancersDAO.pushRate(
      freelancerId,
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
    const { data, success, statusCode } = await DAOs.freelancersDAO.isRated(
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
async function unrateEmployer(req, res, next) {
  try {
    const { employerId, freelancerId } = req.body;
    const { success, statusCode, data } = await DAOs.freelancersDAO.pullRate(
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
  createFreelancerProfile,
  uploadFreelancerAvatar,
  uploadDocument,
  getFreelancers,
  searchFreelancer,
  getFreelancerDetails,
  changeFreelancerDetails,
  addEmployment,
  updateEmployment,
  verifyFreelancerPhoneNumber,
  confirmFreelancerPhoneNumber,
  rateFreelancer,
  isRated,
  unrateEmployer,
};
