import dotenv from "dotenv";

dotenv.config();

const MONGO_OPTIONS = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  socketTimeoutMS: 30000,
  keepAlive: true,
  poolSize: 50,
  retryWrites: false,
};

const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_HOST = process.env.MONGO_HOST;

const MONGO = {
  host: MONGO_HOST,
  password: MONGO_PASSWORD,
  username: MONGO_USERNAME,
  options: MONGO_OPTIONS,
  url: `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}`,
};

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || "localhost";
const SERVER_PORT = process.env.SERVER_PORT || 1337;

const SERVER = {
  hostname: SERVER_HOSTNAME,
  port: SERVER_PORT,
};

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACTIVATION_TOKEN_SECRET = process.env.ACTIVATION_TOKEN_SECRET;
const FORGOT_TOKEN_SECRET = process.env.FORGOT_TOKEN_SECRET;

const SECRET_TOKEN = {
  accessToken: ACCESS_TOKEN_SECRET,
  refreshToken: REFRESH_TOKEN_SECRET,
  activationToken: ACTIVATION_TOKEN_SECRET,
  forgotToken: FORGOT_TOKEN_SECRET,
};

const MAIL_GUN_API_KEY = process.env.MAIL_GUN_API_KEY;
const MAIL_GUN_DOMAIN = process.env.MAIL_GUN_DOMAIN;

const MAIL_GUN = {
  apiKey: MAIL_GUN_API_KEY,
  domain: MAIL_GUN_DOMAIN,
};

const MESSAGE_BIRD = {
  liveKey: process.env.MESSAGEBIRD_LIVE_KEY,
};

const NODE_ENV = process.env.NODE_ENV;
const COMPANY = process.env.COMPANY;
const CLIENT_URL = process.env.CLIENT_URL;
const DATABASE = process.env.DATABASE;
const SERVICE_FEE_RATE = process.env.SERVICE_FEE_RATE;

const config = {
  mongo: MONGO,
  server: SERVER,
  secretToken: SECRET_TOKEN,
  mailGun: MAIL_GUN,
  messageBird: MESSAGE_BIRD,
  nodeEnv: NODE_ENV,
  company: COMPANY,
  clientUrl: CLIENT_URL,
  database: DATABASE,
  feeRate: SERVICE_FEE_RATE,
};

export default config;
