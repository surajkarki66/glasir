import app from "./server";
import DAOs from "./dao/index";
import config from "./configs/config";
import logger from "./configs/logger";
import { getDB } from "./utils/db";

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
    const port = config.server.port;
    app.listen(port, () => {
      logger.info(`Listening on PORT ${port}.`);
    });
  })
  .catch((err) => {
    logger.error(`Error connecting to the MongoDB URI: ${err.stack}`);
    process.exit(1);
  });
