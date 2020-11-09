import {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
} from "./auth-permission";

import { checkAuth } from "./auth-validation";
import { dataValidation } from "./data-validation";

export const permissions = {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
};
export const authValidation = { checkAuth };
export { dataValidation };
