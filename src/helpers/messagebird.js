import dotenv from "dotenv";
import messagebird from "messagebird";

dotenv.config();
export const mb = messagebird(process.env.MESSAGEBIRD_TEST_KEY);
