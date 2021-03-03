import messageBird from "messagebird";

import config from "./config";

const messageB = messageBird(config.messageBird.liveKey);

export default messageB;
