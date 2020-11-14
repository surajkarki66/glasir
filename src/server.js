import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";

import apiErrorHandler from "./error/api-error-handler";
import routes from "./routes/index";

const app = express();

dotenv.config();

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

app.use("/api/v1/user", routes.userRoutes);

app.use("/api-docs", routes.swaggerRoutes);

app.use(apiErrorHandler);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

export default app;
