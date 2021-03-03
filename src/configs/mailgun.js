import mailgun from "mailgun-js";

import config from "./config";

const mailGun = mailgun({
  apiKey: config.mailGun.apiKey,
  domain: config.mailGun.domain,
});

export default mailGun;
