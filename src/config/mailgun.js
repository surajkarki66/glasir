import mailgun from "mailgun-js";

import config from "./config";

const mg = mailgun({
  apiKey: config.mailGun.apiKey,
  domain: config.mailGun.domain,
});

export default mg;
