import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import compression from "compression";

import client from "./index";

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

// Database connection
client
  .then((client) => {
    console.log("Database connected successfully.");
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

// Development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server Listening on ${port}`);
});
