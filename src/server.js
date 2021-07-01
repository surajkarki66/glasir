import cors from "cors";
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import path from "path";
import express from "express";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";

import config from "./configs/config";
import apiErrorHandler from "./errors/api-error-handler";
import userRoutes from "./routes/user.route";
import freelancerRoutes from "./routes/freelancer.route";
import commonRoutes from "./routes/common.route";
import employerRoutes from "./routes/employer.route";
import jobRoutes from "./routes/job.route";
import saveJobRoutes from "./routes/saveJob.route";

const app = express();

// Body parser
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  }),
);

// Cookie parser
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent xss attack
app.use(xss());

// Prevent http param pollution
app.use(hpp());

// Cors
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  }),
);

// Compression
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
  }),
);

if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// Static routes
app.use(
  "/uploads",
  express.static(path.join(__dirname + "/../public/uploads/")),
);

// Controller routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/freelancer", freelancerRoutes);
app.use("/api/v1/common", commonRoutes);
app.use("/api/v1/employer", employerRoutes);
app.use("/api/v1/job", jobRoutes);
app.use("/api/v1/saveJob", saveJobRoutes);

// Error middleware
app.use(apiErrorHandler);

export default app;
