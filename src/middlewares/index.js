import fileUpload from "./upload";

import authPermissions from "./auth-permissions";
import freelancerPermissions from "./freelancer-permissions";
import employerPermissions from "./employer-permissions";
import jobPermissions from "./job-permissions";
import proposalPermissions from "./proposal-permissions";
import contractPermissions from "./contract-permissions";

import validations from "./validation";

export const permissions = {
  authPermissions,
  freelancerPermissions,
  employerPermissions,
  jobPermissions,
  proposalPermissions,
  contractPermissions,
};

export default validations;

export const file = { fileUpload };
