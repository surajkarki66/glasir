import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";

import apiErrorHandler from "./error/api-error-handler";
import { userRoutes, swaggerRoutes } from "./routes/index";

const app = express();

// Config .env
dotenv.config();

// Middlewares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
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

// Routes
app.use("/api/v1/user", userRoutes);

// swagger docs route
app.use("/api-docs", swaggerRoutes);

app.use(apiErrorHandler);

// Development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

export default app;
