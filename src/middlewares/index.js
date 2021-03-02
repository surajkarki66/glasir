import fileUpload from "./upload";

import authPermissions from "./auth-permission";
import freelancerPermissions from "./freelancer-permission";
import clientPermissions from "./client-permission";

import validations from "./validation";

export const permissions = {
  authPermissions,
  freelancerPermissions,
  clientPermissions,
};

export default validations;

export const file = { fileUpload };
