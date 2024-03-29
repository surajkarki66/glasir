import { Router } from "express";
import ContractController from "../controllers/contract.controller";
import Schemas from "../helpers/schemas/index";
import validations, { permissions } from "../middlewares/index";

const router = new Router();

const { checkAuth, dataValidation } = validations;
const { freelancerPermissions, employerPermissions, contractPermissions } =
  permissions;

router
  .route("/getFreelancerContracts")
  .get(checkAuth)
  .get(
    dataValidation(Schemas.contractSchema.getFreelancerContractsLIST, "query"),
  )
  .get(
    freelancerPermissions.onlyFreelancerCanDoThisAction,
    freelancerPermissions.onlySameFreelancerCanDoThisAction,
  )
  .get(ContractController.getFreelancerContracts);

router
  .route("/getEmployerContracts")
  .get(checkAuth)
  .get(dataValidation(Schemas.contractSchema.getEmployerContractsLIST, "query"))
  .get(
    employerPermissions.onlyEmployerCanDoThisAction,
    employerPermissions.onlySameEmployerCanDoThisAction,
  )
  .get(ContractController.getEmployerContracts);

router
  .route("/getContractDetails/:contractId")
  .get(checkAuth)
  .get(dataValidation(Schemas.contractSchema.getContractDETAILS, "params"))
  .get(contractPermissions.onlyContractOwnerCanDoThisAction)
  .get(ContractController.getContractDetails);

router
  .route("/activateContract")
  .post(checkAuth)
  .post(dataValidation(Schemas.contractSchema.contractACTIVATE, "body"))
  .post(
    employerPermissions.onlyEmployerCanDoThisAction,
    employerPermissions.onlySameEmployerCanDoThisAction,
    contractPermissions.onlyContractOwnerCanDoThisAction,
  )
  .post(ContractController.activateContract);

router
  .route("/closeContract")
  .post(checkAuth)
  .post(dataValidation(Schemas.contractSchema.contractCLOSE, "body"))
  .post(
    employerPermissions.onlyEmployerCanDoThisAction,
    employerPermissions.onlySameEmployerCanDoThisAction,
    contractPermissions.onlyContractOwnerCanDoThisAction,
  )
  .post(ContractController.closeContract);

export default router;
