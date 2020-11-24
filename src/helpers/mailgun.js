import mailgun from "mailgun-js";
import dotenv from "dotenv";

dotenv.config();

export const mg = mailgun({
  apiKey: process.env.MAIL_GUN_API_KEY,
  domain: process.env.MAIL_GUN_DOMAIN,
});
