import { ObjectId } from "mongodb";

import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";
import { writeServerResponse } from "../helpers/response";

async function getFreelancerContracts(req, res, next) {
  try {
    const { freelancerId, page, contractsPerPage } = req.query;
    const filter = { freelancer: ObjectId(freelancerId), isActive: true };
    const { success, data, totalNumContracts, statusCode } =
      await DAOs.contractsDAO.getContracts({ filter, page, contractsPerPage });
    if (success) {
      const serverResponse = {
        status: "success",
        contracts: data,
        page: parseInt(page),
        filters: {},
        entriesPerPage: parseInt(contractsPerPage),
        totalResults: totalNumContracts,
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    }
    next(ApiError.notfound("Contracts are not found."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function getEmployerContracts(req, res, next) {
  try {
    const { employerId, page, contractsPerPage } = req.query;
    const filter = { employer: ObjectId(employerId) };
    const { success, data, totalNumContracts, statusCode } =
      await DAOs.contractsDAO.getContracts({ filter, page, contractsPerPage });
    if (success) {
      const serverResponse = {
        status: "success",
        contracts: data,
        page: parseInt(page),
        filters: {},
        entriesPerPage: parseInt(contractsPerPage),
        totalResults: totalNumContracts,
      };
      return writeServerResponse(
        res,
        serverResponse,
        statusCode,
        "application/json",
      );
    }
    next(ApiError.notfound("Contracts are not found."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

async function getContractDetails(req, res, next) {
  try {
    const { contractId } = req.params;
    const { role } = req.jwt;
    const { success, data, statusCode } =
      await DAOs.contractsDAO.getContractById(contractId, role);

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
    next(ApiError.notfound("Contract doesn't exist."));
    return;
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

export default {
  getFreelancerContracts,
  getEmployerContracts,
  getContractDetails,
};
