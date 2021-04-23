import { Router } from "express";

import Schemas from "../helpers/schemas/index";
import UserController from "../controllers/user.controller";
import validations, { permissions } from "../middlewares/index";

const router = new Router();

const { checkAuth, dataValidation } = validations;
const { authPermissions } = permissions;

router
  .route("/get-users")
  .get(checkAuth)
  .get(authPermissions.onlyAdminCanDoThisAction)
  .get(dataValidation(Schemas.userSchema.userLIST, "query"))
  .get(UserController.getUsers);

router
  .route("/login")
  .post(dataValidation(Schemas.userSchema.userLOGIN, "body"))
  .post(UserController.login);

router
  .route("/signup")
  .post(dataValidation(Schemas.userSchema.userSIGNUP, "body"))
  .post(UserController.signup);

router
  .route("/activate")
  .patch(dataValidation(Schemas.userSchema.userACTIVATION, "body"))
  .patch(UserController.activation);

router.route("/loggedIn").get(UserController.loggedIn);

router.route("/logout").get(UserController.logout);

router
  .route("/forgot-password")
  .post(dataValidation(Schemas.userSchema.passwordFORGOT, "body"))
  .post(UserController.forgotPassword);

router
  .route("/reset-password")
  .post(dataValidation(Schemas.userSchema.passwordRESET, "body"))
  .post(UserController.resetPassword);

router
  .route("/change-password/:userId")
  .patch(checkAuth)
  .patch(authPermissions.onlySameUserCanDoThisAction)
  .patch(dataValidation(Schemas.userSchema.passwordCHANGE, "body"))
  .patch(UserController.changePassword);

router
  .route("/change-user-details/:userId")
  .patch(checkAuth)
  .patch(authPermissions.onlySameUserCanDoThisAction)
  .patch(dataValidation(Schemas.userSchema.userDetailsCHANGE, "body"))
  .patch(UserController.changeUserDetails);

router
  .route("/change-email/:userId")
  .patch(checkAuth)
  .patch(authPermissions.onlySameUserCanDoThisAction)
  .patch(dataValidation(Schemas.userSchema.emailCHANGE, "body"))
  .patch(UserController.changeEmail);

router
  .route("/verify-email")
  .post(checkAuth)
  .post(dataValidation(Schemas.userSchema.userACTIVATIONEMAIL, "body"))
  .post(authPermissions.onlySameUserCanDoThisAction)
  .post(UserController.verifyEmail);

router
  .route("/delete/:userId")
  .delete(checkAuth)
  .delete(authPermissions.onlySameUserCanDoThisAction)
  .delete(dataValidation(Schemas.userSchema.userDELETE, "body"))
  .delete(UserController.deleteUser);

router
  .route("/details/:userId")
  .get(checkAuth)
  .get(authPermissions.onlySameUserOrAdminCanDoThisAction)
  .get(dataValidation(Schemas.userSchema.userDETAILS, "params"))
  .get(UserController.getUserDetails);

export default router;
