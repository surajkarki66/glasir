import redis from "redis";

import logger from "../configs/logger";

const client = redis.createClient();

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

export { client };
