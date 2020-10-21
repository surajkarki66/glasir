import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import compression from "compression";

import client from "./index";
import logger from "./utils/logger";

const app = express();

// Config .env
dotenv.config();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  compression({
    level: 6,
    threshold: 100 * 100, // 100 KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// Development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const port = process.env.PORT || 8000;
client
  .then((client) => {
    // inject db
    logger.info("Database connected successfully.");
  })
  .catch((err) => {
    logger.error(`Error connecting to the MongoDB URI: ${err.stack}`);
    process.exit(1);
  });

app.listen(port, () => {
  logger.info(`Listening on PORT ${port}.`);
});
