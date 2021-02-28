import { ObjectId } from "bson";
import parsePhoneNumber from "libphonenumber-js";

import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";
import { writeServerResponse } from "../helpers/response";

export async function createClientProfile(req, res, next) {
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

export async function getClients(req, res, next) {
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
export async function getClientDetails(req, res, next) {
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
