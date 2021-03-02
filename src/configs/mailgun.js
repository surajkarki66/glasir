import mailgun from "mailgun-js";

import config from "./config";

export default mailgun({
  apiKey: config.mailGun.apiKey,
  domain: config.mailGun.domain,
});
