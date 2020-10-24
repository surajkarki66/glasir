import dotenv from "dotenv";
import { MongoClient } from "mongodb";

// Local Module
import logger from "./utils/logger";
import app from "./server";
import { userDAO } from "./dao/index.js";

// .env config
dotenv.config();

MongoClient.connect(process.env.MONGO_URI, {
  wtimeout: 2500,
  w: "majority",
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((client) => {
    // inject db
    userDAO.injectDB(client);
    logger.info("Database connected successfully.");

    // Node Server
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      logger.info(`Listening on PORT ${port}.`);
    });
  })
  .catch((err) => {
    logger.error(`Error connecting to the MongoDB URI: ${err.stack}`);
    process.exit(1);
  });
