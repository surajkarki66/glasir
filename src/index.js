import dotenv from "dotenv";

import app from "./server";
import DAOs from "./dao/index";
import logger from "./utils/logger";
import { getDB } from "./utils/db";

dotenv.config();

getDB()
  .then((client) => {
    DAOs.usersDAO.injectDB(client);
    DAOs.freelancersDAO.injectDB(client);
    logger.info("Database connected successfully.");

    require("./utils/redis");

    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      logger.info(`Listening on PORT ${port}.`);
    });
  })
  .catch((err) => {
    logger.error(`Error connecting to the MongoDB URI: ${err.stack}`);
    process.exit(1);
  });
