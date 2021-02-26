import {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
  onlyActiveUserCanDoThisAction,
  noAdminCanDoThisAction,
} from "./auth-permission";

import {
  onlyFreelancerCanDoThisAction,
  onlySameFreelancerCanDoThisAction,
} from "./freelancer-permission";

import { onlyClientCanDoThisAction } from "./client-permission";

import { checkAuth } from "./auth-validation";
import { dataValidation } from "./data-validation";
import { fileUpload } from "./upload";

export const permissions = {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
  onlyFreelancerCanDoThisAction,
  onlySameFreelancerCanDoThisAction,
  onlyActiveUserCanDoThisAction,
  noAdminCanDoThisAction,
  onlyClientCanDoThisAction,
};
export const authValidation = { checkAuth };
export const file = { fileUpload };
export { dataValidation };
