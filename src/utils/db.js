import dotenv from "dotenv";
import MongoClient from "mongodb";

// .env config
dotenv.config();

export const getDB = async () => {
  const client = await MongoClient.connect(process.env.MONGO_URI, {
    w: "majority",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return client;
};
