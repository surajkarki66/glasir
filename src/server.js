import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

const app = express();

// Config .env
dotenv.config();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server Listening on ${port}`);
});
