import {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
} from "./auth-permission";

import {
  onlyFreelancerCanDoThisAction,
  onlySameFreelancerCanDoThisAction,
} from "./freelancer-permission";

import { checkAuth } from "./auth-validation";
import { dataValidation } from "./data-validation";
import { fileUpload } from "./upload";

export const permissions = {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
  onlyFreelancerCanDoThisAction,
  onlySameFreelancerCanDoThisAction,
};
export const authValidation = { checkAuth };
export const file = { fileUpload };
export { dataValidation };
