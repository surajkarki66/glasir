import redis from "redis";

import logger from "../utils/logger";

const redisServer = () => {
  const client = redis.createClient({
    port: 6379,
    host: "127.0.0.1",
  });

  client.on("connect", () => {
    logger.info("Client connected to redis...");
  });

  client.on("ready", () => {
    logger.info("Client connected to redis and ready to use...");
  });

  client.on("error", (err) => {
    logger.error(err.message);
  });

  client.on("end", () => {
    logger.info("Client disconnected from redis");
  });

  process.on("SIGINT", () => {
    client.quit();
  });
  return client;
};

export default redisServer;
