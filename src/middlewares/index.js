import {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
} from "./auth-permission";

import { checkAuth } from "./auth-validation";
import { dataValidation } from "./data-validation";

const permissions = {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
};
const authValidation = { checkAuth };

export { permissions, authValidation, dataValidation };
