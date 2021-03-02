import messageBird from "messagebird";

import config from "./config";

export default messageBird(config.messageBird.liveKey);
