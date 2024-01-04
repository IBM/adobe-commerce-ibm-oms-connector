const { Core } = require("@adobe/aio-sdk");

async function log(message, actionName, type, logLevel) {
    if (type == "info") {
        const logger = Core.Logger(actionName, { level: logLevel || "info" });
        logger.info(message);
    }
}

export { log }