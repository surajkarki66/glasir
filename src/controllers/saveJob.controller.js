import { ObjectId } from "mongodb";
import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";
import { writeServerResponse } from "../helpers/response";

async function saveJob(req, res, next) {
  try {
    const { jobId } = req.body;
    const { aud } = req.jwt;
    if (await DAOs.saveJobsDAO.getSaveJobByJobId(jobId)) {
      next(ApiError.badRequest("Job is already saved"));
      return;
    }
    const saveJobInfo = { job: ObjectId(jobId), user: ObjectId(aud) };
    const { success, data, statusCode } = await DAOs.saveJobsDAO.createSaveJob(
      saveJobInfo,
    );
    if (success) {
      const serverResponse = {
        status: "success",
        data: { message: "Job is saved successfully" },
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

export default { saveJob };
