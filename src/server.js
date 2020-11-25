import cors from "cors";
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";
import path from "path";
import express from "express";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";

import apiErrorHandler from "./error/api-error-handler";
import userRoutes from "./routes/user";
import freelancerRoutes from "./routes/freelancer";

const app = express();

// Load environment variables
dotenv.config();

// Body parser
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

// Cookie parser
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent xss atack
app.use(xss());

// Prevent http param pollution
app.use(hpp());

// Cors
app.use(cors());

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
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Static routes
app.use(
  "/uploads",
  express.static(path.join(__dirname + "/../public/uploads"))
);

// Controller routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/freelancer", freelancerRoutes);

// Error middleware
app.use(apiErrorHandler);

export default app;
