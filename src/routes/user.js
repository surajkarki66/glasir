import { Router } from "express";

import { Schemas } from "../helpers/schemas/index";
import { UserController } from "../controllers/index";
import {
  permissions,
  authValidation,
  dataValidation,
} from "../middlewares/index";

const router = new Router();

router
  .route("/get-users")
  .get(authValidation.checkAuth)
  .get(permissions.onlyAdminCanDoThisAction)
  .get(dataValidation(Schemas.userSchema.userLIST, "query"))
  .get(UserController.getUsers);

router
  .route("/login")
  .post(dataValidation(Schemas.userSchema.userLOGIN, "body"))
  .post(UserController.login);

router
  .route("/refresh-token")
  .post(dataValidation(Schemas.userSchema.refreshTOKEN, "body"))
  .post(UserController.refreshToken);

router
  .route("/signup")
  .post(dataValidation(Schemas.userSchema.userSIGNUP, "body"))
  .post(UserController.signup);

router
  .route("/activate")
  .patch(dataValidation(Schemas.userSchema.userACTIVATION, "body"))
  .patch(UserController.activation);

router
  .route("/logout")
  .post(authValidation.checkAuth)
  .post(dataValidation(Schemas.userSchema.userLOGOUT, "body"))
  .post(UserController.logout);

router
  .route("/forgot-password")
  .post(dataValidation(Schemas.userSchema.passwordFORGOT, "body"))
  .post(UserController.forgotPassword);

router
  .route("/reset-password")
  .post(dataValidation(Schemas.userSchema.passwordRESET, "body"))
  .post(UserController.resetPassword);

router
  .route("/change-password")
  .patch(authValidation.checkAuth)
  .patch(permissions.onlySameUserCanDoThisAction)
  .patch(dataValidation(Schemas.userSchema.passwordCHANGE, "body"))
  .patch(UserController.changePassword);

router
  .route("/change-user-details/:userId")
  .patch(authValidation.checkAuth)
  .patch(permissions.onlySameUserCanDoThisAction)
  .patch(dataValidation(Schemas.userSchema.userDetailsCHANGE, "body"))
  .patch(UserController.changeUserDetails);

router
  .route("/change-email")
  .patch(authValidation.checkAuth)
  .patch(permissions.onlySameUserCanDoThisAction)
  .patch(dataValidation(Schemas.userSchema.emailCHANGE, "body"))
  .patch(UserController.changeEmail);

router
  .route("/verify-email")
  .patch(authValidation.checkAuth)
  .patch(permissions.onlySameUserCanDoThisAction)
  .patch(dataValidation(Schemas.userSchema.userACTIVATIONEMAIL, "body"))
  .patch(UserController.verifyEmail);

router
  .route("/delete/:userId")
  .delete(authValidation.checkAuth)
  .delete(permissions.onlySameUserOrAdminCanDoThisAction)
  .delete(dataValidation(Schemas.userSchema.userDELETE, "body"))
  .delete(UserController.deleteUser);

router
  .route("/:userId")
  .get(authValidation.checkAuth)
  .get(permissions.onlySameUserOrAdminCanDoThisAction)
  .get(dataValidation(Schemas.userSchema.userDETAILS, "params"))
  .get(UserController.getUserDetails);

export default router;
