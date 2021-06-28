import app from "./server";
import DAOs from "./dao/index";
import config from "./configs/config";
import logger from "./configs/logger";
import db from "./utils/db";

db()
  .then((client) => {
    // Injecting connection
    DAOs.usersDAO.injectDB(client);
    DAOs.freelancersDAO.injectDB(client);
    DAOs.employersDAO.injectDB(client);
    DAOs.jobsDAO.injectDB(client);

    // logging
    logger.info("Database connected successfully.");

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
