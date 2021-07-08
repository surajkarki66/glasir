import { ObjectId } from "mongodb";

import config from "../configs/config";
import logger from "../configs/logger";

class ContractsDAO {
  static #contracts;

  static async injectDB(conn) {
    if (ContractsDAO.#contracts) {
      return;
    }
    try {
      ContractsDAO.#contracts = await conn
        .db(config.database)
        .collection("contracts");
      logger.info(
        `Connected to contracts collection of ${config.database} database.`,
        "ContractsDAO.injectDB()",
      );
    } catch (e) {
      logger.error(
        `Error while injecting DB: ${e.message}`,
        "ContractsDAO.injectDB()",
      );
      throw e;
    }
  }
  static async createContract(contractInfo) {
    try {
      const result = await ContractsDAO.#contracts.insertOne(contractInfo);
      if (result && result.insertedCount === 1) {
        const data = result.ops[0];
        return {
          success: true,
          data: data,
          statusCode: 201,
        };
      } else {
        return {
          success: false,
          data: {
            error: "Contract is not created",
          },
          statusCode: 500,
        };
      }
    } catch (error) {
      logger.error(
        `Error occurred while adding new contract, ${error.message}.`,
      );
      throw error;
    }
  }
  static async getContractByFreelancerIdAndJobIdAndEmployerId(
    freelancerId,
    jobId,
    employerId,
  ) {
    return await ContractsDAO.#contracts.findOne({
      job: ObjectId(jobId),
      freelancer: ObjectId(freelancerId),
      employer: ObjectId(employerId),
    });
  }
}

export default ContractsDAO;
