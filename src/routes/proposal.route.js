import { Router } from "express";
import ProposalController from "../controllers/proposal.controller";
import Schemas from "../helpers/schemas/index";
import validations, { permissions, file } from "../middlewares/index";

const router = new Router();

const { checkAuth, dataValidation } = validations;
const {
  freelancerPermissions,
  employerPermissions,
  jobPermissions,
  proposalPermissions,
} = permissions;

router
  .route("/createProposal")
  .post(checkAuth)
  .post(
    file
      .fileUpload("../../../public/uploads/documents/proposals/", [])
      .array("additionalFiles", 10),
  )
  .post(freelancerPermissions.onlyFreelancerCanDoThisAction)
  .post(dataValidation(Schemas.proposalSchema.proposalCREATE, "body"))
  .post(ProposalController.createProposal);

router
  .route("/isProposalExist/:jobId/:freelancerId")
  .get(checkAuth)
  .get(dataValidation(Schemas.proposalSchema.isProposalEXIST, "params"))
  .get(
    freelancerPermissions.onlyFreelancerCanDoThisAction,
    freelancerPermissions.onlySameFreelancerCanDoThisAction,
  )
  .get(ProposalController.isProposalExist);

router
  .route("/getJobProposalDetails/:proposalId")
  .get(checkAuth)
  .get(dataValidation(Schemas.proposalSchema.getJobProposalDETAILS, "params"))
  .get(employerPermissions.onlyEmployerCanDoThisAction)
  .get(ProposalController.getJobProposalDetails);

router
  .route("/getJobProposals")
  .get(checkAuth)
  .get(dataValidation(Schemas.proposalSchema.getJobProposalsLIST, "query"))
  .get(
    employerPermissions.onlyEmployerCanDoThisAction,
    jobPermissions.onlyJobOwnerCanDoThisAction,
  )
  .get(ProposalController.getJobProposals);

router
  .route("/getFreelancerProposals")
  .get(checkAuth)
  .get(
    dataValidation(Schemas.proposalSchema.getFreelancerProposalsLIST, "query"),
  )
  .get(
    freelancerPermissions.onlyFreelancerCanDoThisAction,
    freelancerPermissions.onlySameFreelancerCanDoThisAction,
  )
  .get(ProposalController.getFreelancerProposals);
router
  .route("/:proposalId")
  .get(checkAuth)
  .get(
    freelancerPermissions.onlyFreelancerCanDoThisAction,
    proposalPermissions.onlyProposalOwnerCanDoThisAction,
  )
  .get(dataValidation(Schemas.proposalSchema.getProposalDETAILS, "params"))
  .get(ProposalController.getProposalDetails);

router
  .route("/changeProposalDetails/:proposalId/:freelancerId")
  .patch(checkAuth)
  .patch(dataValidation(Schemas.proposalSchema.changeProposalDETAILS, "body"))
  .patch(
    freelancerPermissions.onlyFreelancerCanDoThisAction,
    freelancerPermissions.onlySameFreelancerCanDoThisAction,
    proposalPermissions.onlyProposalOwnerCanDoThisAction,
  )
  .patch(ProposalController.changeProposalDetails);

router
  .route("/withdrawProposal/:proposalId/:freelancerId")
  .delete(checkAuth)
  .delete(dataValidation(Schemas.proposalSchema.proposalDELETE, "params"))
  .delete(
    freelancerPermissions.onlyFreelancerCanDoThisAction,
    freelancerPermissions.onlySameFreelancerCanDoThisAction,
    proposalPermissions.onlyProposalOwnerCanDoThisAction,
  )
  .delete(ProposalController.withdrawProposal);

export default router;
