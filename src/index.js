import dotenv from "dotenv";
import { MongoClient } from "mongodb";

// .env config
dotenv.config();

const client = MongoClient.connect(process.env.MONGO_URI, {
  wtimeout: 2500,
  w: "majority",
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default client;
