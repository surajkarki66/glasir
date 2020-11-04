import { Router } from "express";

import { UserController } from "../controllers/index";
import { userSchema } from "../helpers/index";
import dataValidation from "../middlewares/data-validation";
import { checkAuth } from "../middlewares/auth-validation";
import { onlySameUserCanDoThisAction } from "../middlewares/auth-permission";

const router = new Router();

router
  .route("/get-users")
  .get(checkAuth)
  .get(dataValidation(userSchema.userLIST, "query"))
  .get(UserController.getUsers);

router
  .route("/signup")
  .post(dataValidation(userSchema.userSIGNUP, "body"))
  .post(UserController.signup);

router
  .route("/login")
  .post(dataValidation(userSchema.userLOGIN, "body"))
  .post(UserController.login);

router
  .route("/refresh-token")
  .post(dataValidation(userSchema.refreshTOKEN, "body"))
  .post(UserController.refreshToken);

router
  .route("/logout")
  .post(checkAuth)
  .post(dataValidation(userSchema.userLOGOUT, "body"))
  .post(UserController.logout);

router
  .route("/change-user-details/:id")
  .patch(checkAuth)
  .patch(onlySameUserCanDoThisAction)
  .patch(dataValidation(userSchema.userDetailsCHANGE, "body"))
  .patch(UserController.changeUserDetails);

router
  .route("/change-email/:id")
  .patch(checkAuth)
  .patch(onlySameUserCanDoThisAction)
  .patch(dataValidation(userSchema.emailCHANGE, "body"))
  .patch(UserController.changeEmail);

router
  .route("/forgot-password")
  .post(dataValidation(userSchema.passwordFORGOT, "body"))
  .post(UserController.forgotPassword);

router
  .route("/reset-password/:token")
  .post(dataValidation(userSchema.passwordRESET, "body"))
  .post(UserController.resetPassword);

router
  .route("/delete/:id")
  .delete(checkAuth)
  .delete(onlySameUserCanDoThisAction)
  .delete(dataValidation(userSchema.userDELETE, "body"))
  .delete(UserController.delete);

router
  .route("/:id")
  .get(checkAuth)
  .get(dataValidation(userSchema.userDETAILS, "params"))
  .get(UserController.getUserDetails);

router
  .route("/activate/:token")
  .patch(checkAuth)
  .patch(onlySameUserCanDoThisAction)
  .patch(dataValidation(userSchema.userACTIVATION, "params"))
  .patch(UserController.activation);

router
  .route("/verify-email/:id")
  .get(checkAuth)
  .get(onlySameUserCanDoThisAction)
  .get(dataValidation(userSchema.userACTIVATIONEMAIL, "params"))
  .get(UserController.verifyEmail);

export default router;
