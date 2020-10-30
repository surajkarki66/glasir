import { Router } from "express";

import { UserController } from "../controllers/index";
import { userSchema } from "../helpers/index";
import dataValidation from "../middlewares/data-validation";
import { checkAuth } from "../middlewares/auth-validation";
import { onlySameUserCanDoThisAction } from "../middlewares/auth-permission";

const router = new Router();
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
  .post(dataValidation(userSchema.userLOGOUT, "body"))
  .post(UserController.logout);

router
  .route("/delete/:id")
  .delete(checkAuth)
  .delete(dataValidation(userSchema.userDELETE, "body"))
  .delete(UserController.delete);

router
  .route("/change-password/:id")
  .patch(checkAuth)
  .patch(onlySameUserCanDoThisAction)
  .patch(dataValidation(userSchema.passwordCHANGE, "body"))
  .patch(UserController.changePassword);

router
  .route("/get-users")
  .get(dataValidation(userSchema.userLIST, "query"))
  .get(UserController.getUsers);

router
  .route("/activate/:token")
  .patch(dataValidation(userSchema.userACTIVATION, "params"))
  .patch(UserController.activation);

router
  .route("/verify-email/:id")
  .get(dataValidation(userSchema.userACTIVATIONEMAIL, "params"))
  .get(UserController.verifyEmail);

router
  .route("/:id")
  .get(dataValidation(userSchema.userDETAILS, "params"))
  .get(UserController.getUserDetails);

export default router;
