import dotenv from "dotenv";
import messageBird from "messagebird";

dotenv.config();

export const mb = messageBird(process.env.MESSAGEBIRD_LIVE_KEY);
