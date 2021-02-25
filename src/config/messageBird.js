import messageBird from "messagebird";

import config from "./config";

const mb = messageBird(config.messageBird.liveKey);

export default mb;
