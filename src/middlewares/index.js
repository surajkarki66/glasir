import fileUpload from "./upload";

import authPermissions from "./auth-permission";
import freelancerPermissions from "./freelancer-permission";
import employerPermissions from "./employer-permission";
import jobPermissions from "./job-permissions";

import validations from "./validation";

export const permissions = {
  authPermissions,
  freelancerPermissions,
  employerPermissions,
  jobPermissions,
};

export default validations;

export const file = { fileUpload };
