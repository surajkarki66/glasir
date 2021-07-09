import { ObjectId } from "mongodb";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";

import config from "../configs/config";
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

async function activateContract(req, res, next) {
  try {
    const { contractId, freelancerId, employerId, token, fixedBidAmount } =
      req.body;
    const { isActive, isClosed } =
      await DAOs.contractsDAO.getContractByContractId(contractId);
    if (isActive) {
      next(ApiError.forbidden("Contract is already activated."));
      return;
    }
    if (isClosed) {
      next(ApiError.forbidden("Contract is closed."));
      return;
    }
    const { currencyCode, amount } = fixedBidAmount;
    const stripe = new Stripe(config.stripePrivKey);
    const idempotencyKey = uuidv4();
    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
      metadata: { employerId: employerId },
    });
    if (customer) {
      const result = await stripe.charges.create(
        {
          amount: amount * 100,
          currency: currencyCode,
          customer: customer.id,
          receipt_email: token.email,
          description: "Employer paid the bid amount.",
          metadata: {
            paidToFreelancer: freelancerId,
          },
        },
        { idempotencyKey },
      );
      if (result) {
        const { success, data, statusCode } =
          await DAOs.contractsDAO.updateContract(contractId, {
            isActive: true,
          });
        if (success) {
          await Promise.all([
            DAOs.employersDAO.incrementMoneySpent(employerId, amount),
            DAOs.freelancersDAO.incrementCurrentBalance(freelancerId, amount),
            DAOs.freelancersDAO.incrementTotalMoneyEarned(freelancerId, amount),
            DAOs.employersDAO.updateEmployer(employerId, {
              "payment.method": "card",
              "payment.isVerified": true,
            }),
          ]);

          const serverResponse = {
            status: "success",
            data: { message: "Contract is activated successfully." },
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
      }
    }
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}
async function closeContract(req, res, next) {
  try {
    const { contractId, freelancerId, jobId } = req.body;
    const updateObj = { isClosed: true };
    const { success, data, statusCode } =
      await DAOs.contractsDAO.updateContract(contractId, updateObj);
    if (success) {
      await DAOs.jobsDAO.removeFreelancerId(freelancerId, jobId);
      const serverResponse = {
        status: "success",
        data: { message: "Contract is closed successfully." },
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
  } catch {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

export default {
  getFreelancerContracts,
  getEmployerContracts,
  getContractDetails,
  activateContract,
  closeContract,
};
