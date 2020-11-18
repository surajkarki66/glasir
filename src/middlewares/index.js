import {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
  onlyFreelancerCanDoThisAction,
} from "./auth-permission";

import { checkAuth } from "./auth-validation";
import { dataValidation } from "./validation";
import { fileUpload, fileMiddleware } from "./upload";

export const permissions = {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
  onlyFreelancerCanDoThisAction,
};
export const authValidation = { checkAuth };
export const file = { fileUpload, fileMiddleware };
export { dataValidation };
