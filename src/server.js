import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import compression from "compression";
import jwt from "express-jwt";

import apiErrorHandler from "./error/api-error-handler";

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
app.use(apiErrorHandler);
app.use(jwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] }));

// Development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

export default app;
