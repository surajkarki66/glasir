import dotenv from "dotenv";

import app from "./server";
import DAOs from "./dao/index";
import logger from "./utils/logger";
import { getDB } from "./utils/db";

dotenv.config();

getDB()
  .then((client) => {
    // Injecting connection
    DAOs.usersDAO.injectDB(client);
    DAOs.freelancersDAO.injectDB(client);
    DAOs.clientsDAO.injectDB(client);

    // logging
    logger.info("Database connected successfully.");

    // redis
    require("./utils/redis");

    // app server
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      logger.info(`Listening on PORT ${port}.`);
    });
  })
  .catch((err) => {
    logger.error(`Error connecting to the MongoDB URI: ${err.stack}`);
    process.exit(1);
  });
