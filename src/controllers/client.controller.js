import { ObjectId } from "bson";
import parsePhoneNumber from "libphonenumber-js";

import DAOs from "../dao/index";
import messageBird from "../configs/messageBird";
import ApiError from "../errors/ApiError";
import { writeServerResponse } from "../helpers/response";

async function createClientProfile(req, res, next) {
  try {
    const clientInfo = req.body;
    const { aud } = req.jwt;
    const { phone } = clientInfo;

    const phoneNumber = parsePhoneNumber(phone.phoneNumber);
    if (phoneNumber && phoneNumber.isValid()) {
      const info = {
        ...clientInfo,
        user: ObjectId(aud),
        phone: { ...phone, isVerified: false },
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (await DAOs.clientsDAO.getClientByPhone(phone.phoneNumber)) {
        next(ApiError.conflict("Phone number is already used."));
        return;
      }
      const { success, data, statusCode } = await DAOs.clientsDAO.createClient(
        info,
      );
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

async function getClients(req, res, next) {
  try {
    const { page, clientsPerPage } = req.query;
    const {
      success,
      data,
      statusCode,
      totalNumClients,
    } = await DAOs.clientsDAO.getClients({
      page,
      clientsPerPage,
    });
    if (success) {
      const serverResponse = {
        status: "success",
        data: data,
        page: Number(page),
        filters: {},
        entries_per_page: Number(clientsPerPage),
        totalResults: totalNumClients,
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
async function getClientDetails(req, res, next) {
  try {
    const { clientId } = req.params;
    const { success, data, statusCode } = await DAOs.clientsDAO.getClientById(
      clientId,
    );
    if (success) {
      const serverResponse = {
        status: "success",
        data: { ...data, password: null },
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    } else {
      next(ApiError.notfound("Client doesn't exist."));
      return;
    }
  } catch (error) {
    next(ApiError.internal("Something went wrong: ", error.messages));
    return;
  }
}

async function changeClientDetails(req, res, next) {
  try {
    const { clientId } = req.params;
    const { phone } = req.body;
    let clientDetails = {
      ...req.body,
      isVerified: false,
      updatedAt: new Date(),
    };
    if (phone) {
      clientDetails = {
        ...req.body,
        isVerified: false,
        phone: { ...phone, isVerified: false },
        updatedAt: new Date(),
      };
    }
    const { success, data, statusCode } = await DAOs.clientsDAO.updateClient(
      clientId,
      clientDetails,
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

async function uploadClientAvatar(req, res, next) {
  try {
    const file = req.file;
    if (!file) {
      next(ApiError.badRequest("No image selected."));
      return;
    }
    const { clientId } = req.params;
    const updateObject = { avatar: file.filename, updatedAt: new Date() };
    const { success, data, statusCode } = await DAOs.clientsDAO.updateClient(
      clientId,
      updateObject,
    );
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

async function verifyClientPhoneNumber(req, res, next) {
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

async function confirmClientPhoneNumber(req, res, next) {
  try {
    const { id, token, clientId } = req.body;
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
      DAOs.clientsDAO.updateClient(clientId, updateObject).then((response) => {
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
export default {
  createClientProfile,
  getClients,
  getClientDetails,
  changeClientDetails,
  uploadClientAvatar,
  verifyClientPhoneNumber,
  confirmClientPhoneNumber,
};
