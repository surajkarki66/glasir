import {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
  onlyFreelancerCanDoThisAction,
} from "./auth-permission";

import { checkAuth } from "./auth-validation";
import { dataValidation, imageValidation } from "./validation";
import { fileUpload } from "./upload";

const permissions = {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
  onlyFreelancerCanDoThisAction,
};
const authValidation = { checkAuth };

export {
  permissions,
  authValidation,
  dataValidation,
  fileUpload,
  imageValidation,
};
