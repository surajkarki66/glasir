import MongoClient from "mongodb";

import config from "../config/config";

export const getDB = async () => {
  const client = await MongoClient.connect(
    config.mongo.url,
    config.mongo.options,
  );

  return client;
};
