import fileUpload from "./upload";

import authPermissions from "./auth-permission";
import freelancerPermissions from "./freelancer-permission";
import employerPermissions from "./employer-permission";

import validations from "./validation";

export const permissions = {
  authPermissions,
  freelancerPermissions,
  employerPermissions,
};

export default validations;

export const file = { fileUpload };
