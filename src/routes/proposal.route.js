import { Router } from "express";
import ProposalController from "../controllers/proposal.controller";
import Schemas from "../helpers/schemas/index";
import validations, { permissions, file } from "../middlewares/index";

const router = new Router();

const { checkAuth, dataValidation } = validations;
const { freelancerPermissions } = permissions;

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

export default router;
