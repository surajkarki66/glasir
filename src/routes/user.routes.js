import { Router } from "express";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";

import { UserController } from "../controllers/index";
import { userSchema } from "../helpers/index";
import dataValidation from "../middlewares/data-validation";
import { checkAuth } from "../middlewares/auth-validation";
import {
  onlySameUserCanDoThisAction,
  onlyAdminCanDoThisAction,
  onlySameUserOrAdminCanDoThisAction,
} from "../middlewares/auth-permission";

const router = new Router();
const swaggerDocument = YAML.load("./swagger.yaml");

router
  .route("/get-users")
  .get(checkAuth)
  .get(onlyAdminCanDoThisAction)
  .get(dataValidation(userSchema.userLIST, "query"))
  .get(UserController.getUsers);

router
  .route("/login")
  .post(dataValidation(userSchema.userLOGIN, "body"))
  .post(UserController.login);

router
  .route("/refresh-token")
  .post(dataValidation(userSchema.refreshTOKEN, "body"))
  .post(UserController.refreshToken);

router
  .route("/signup")
  .post(dataValidation(userSchema.userSIGNUP, "body"))
  .post(UserController.signup);

router
  .route("/activate")
  .patch(dataValidation(userSchema.userACTIVATION, "body"))
  .patch(UserController.activation);

router
  .route("/logout")
  .post(checkAuth)
  .post(dataValidation(userSchema.userLOGOUT, "body"))
  .post(UserController.logout);

router
  .route("/forgot-password")
  .post(dataValidation(userSchema.passwordFORGOT, "body"))
  .post(UserController.forgotPassword);

router
  .route("/reset-password")
  .post(dataValidation(userSchema.passwordRESET, "body"))
  .post(UserController.resetPassword);

router
  .route("/change-password/:id")
  .patch(checkAuth)
  .patch(onlySameUserCanDoThisAction)
  .patch(dataValidation(userSchema.passwordCHANGE, "body"))
  .patch(UserController.changePassword);

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
  .route("/verify-email/:id")
  .get(checkAuth)
  .get(onlySameUserCanDoThisAction)
  .get(dataValidation(userSchema.userACTIVATIONEMAIL, "params"))
  .get(UserController.verifyEmail);

router
  .route("/delete/:id")
  .delete(checkAuth)
  .delete(onlySameUserOrAdminCanDoThisAction)
  .delete(dataValidation(userSchema.userDELETE, "body"))
  .delete(UserController.delete);

router
  .route("/:id")
  .get(checkAuth)
  .get(onlySameUserOrAdminCanDoThisAction)
  .get(dataValidation(userSchema.userDETAILS, "params"))
  .get(UserController.getUserDetails);

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
