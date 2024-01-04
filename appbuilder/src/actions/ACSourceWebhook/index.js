/*
 * <license header>
 */

/**
 * This is a sample action showcasing how to access an external API
 *
 * Note:
 * You might want to disable authentication and authorization checks against Adobe Identity Management System for a generic action. In that case:
 *   - Remove the require-adobe-auth annotation for this action in the manifest.yml of your application
 *   - Remove the Authorization header from the array passed in checkMissingRequestInputs
 *   - The two steps above imply that every client knowing the URL to this deployed action will be able to invoke it without any authentication and authorization checks against Adobe Identity Management System
 *   - Make sure to validate these changes against your security requirements before deploying the action
 */

const fetch = require("node-fetch");
const { Core } = require("@adobe/aio-sdk");
const {
  errorResponse,
  getBearerToken,
  stringParameters,
  checkMissingRequestInputs,
} = require("../utils");
const { async } = require("regenerator-runtime");
const { getSource, getOauth } = require("../../services/AdobeCommerceService");
const { init } = require("../../config/StateStore");

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });

  try {
    await init();

    // 'info' is the default level if not set
    logger.info("Calling the main action", params);
    const oauth = await getOauth(params, logger);
    const searchKey =
      params.data && params.data.searchKey ? params.data.searchKey : undefined;
    logger.info("Calling the main action 111");
    const content = await getSource(oauth, searchKey);
    logger.info("Calling the main action 222", content);

    const response = {
      statusCode: 200,
      body: content,
    };

    // log the response status code
    logger.info(`${response.statusCode}: successful request`);
    return response;
  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, "server error", logger);
  }
}

exports.main = main;
