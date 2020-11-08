import {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
} from "./auth-permission";

import { checkAuth } from "./auth-validation";
import { dataValidation } from "./data-validation";

export const Permissions = {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
};
export const AuthValidation = { checkAuth };
export { dataValidation };
