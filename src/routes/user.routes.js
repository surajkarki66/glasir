import { Router } from "express";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";

import { Schemas } from "../helpers/schemas/index";
import { UserController } from "../controllers/index";
import { Permissions } from "../middlewares/index";
import { dataValidation } from "../middlewares/index";
import { AuthValidation } from "../middlewares/index";

const router = new Router();
const swaggerDocument = YAML.load("./swagger.yaml");

router
  .route("/get-users")
  .get(AuthValidation.checkAuth)
  .get(Permissions.onlyAdminCanDoThisAction)
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
  .post(AuthValidation.checkAuth)
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
  .route("/change-password/:id")
  .patch(AuthValidation.checkAuth)
  .patch(Permissions.onlySameUserCanDoThisAction)
  .patch(dataValidation(Schemas.userSchema.passwordCHANGE, "body"))
  .patch(UserController.changePassword);

router
  .route("/change-user-details/:id")
  .patch(AuthValidation.checkAuth)
  .patch(Permissions.onlySameUserCanDoThisAction)
  .patch(dataValidation(Schemas.userSchema.userDetailsCHANGE, "body"))
  .patch(UserController.changeUserDetails);

router
  .route("/change-email/:id")
  .patch(AuthValidation.checkAuth)
  .patch(Permissions.onlySameUserCanDoThisAction)
  .patch(dataValidation(Schemas.userSchema.emailCHANGE, "body"))
  .patch(UserController.changeEmail);

router
  .route("/verify-email/:id")
  .get(AuthValidation.checkAuth)
  .get(Permissions.onlySameUserCanDoThisAction)
  .get(dataValidation(Schemas.userSchema.userACTIVATIONEMAIL, "params"))
  .get(UserController.verifyEmail);

router
  .route("/delete/:id")
  .delete(AuthValidation.checkAuth)
  .delete(Permissions.onlySameUserOrAdminCanDoThisAction)
  .delete(dataValidation(Schemas.userSchema.userDELETE, "body"))
  .delete(UserController.deleteUser);

router
  .route("/:id")
  .get(AuthValidation.checkAuth)
  .get(Permissions.onlySameUserOrAdminCanDoThisAction)
  .get(dataValidation(Schemas.userSchema.userDETAILS, "params"))
  .get(UserController.getUserDetails);

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
