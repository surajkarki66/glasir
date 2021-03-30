import { ObjectId } from "bson";

import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";
import { writeServerResponse } from "../helpers/response";

async function createJob(req, res, next) {
  try {
    const { aud } = req.jwt;
    const client = await DAOs.clientsDAO.getClientByUserId(aud);
    if (!client) {
      next(ApiError.notfound("Client not found"));
      return;
    }
    const { _id } = client;
    const jobInfo = {
      ...req.body,
      clientId: ObjectId(_id),
    };
    const { success, data, statusCode } = await DAOs.jobsDAO.createJob(jobInfo);
    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: "Job is created successfully" },
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
  } catch (error) {
    next(ApiError.internal(`Something went wrong: ${error.message}`));
    return;
  }
}

export default { createJob };
