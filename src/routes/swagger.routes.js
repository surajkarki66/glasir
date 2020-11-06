import { Router } from "express";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";

const router = new Router();
const swaggerDocument = YAML.load("./swagger.yaml");

router.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { explorer: true })
);

export default router;
