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
const { getOAuthToken } = require("../../auth/AppBuilderAuth");
const { publishEvent, publishEventGeneric } = require("../AppBuilderEvent");

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });

  try {
    // 'info' is the default level if not set
    logger.info("Calling the main action");

    logger.info("Calling the main action", JSON.stringify(params));
    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params));
    console.log("BEFORE");
    // await wait(120000); //7 seconds in milliseconds
    console.log("AFTER");
    const response = {
      statusCode: 200,
      body: params,
    };

    // log the response status code
    // logger.info(`${response.statusCode}: successful request`);
    // if (
    //   params.data.publish_creditmemo != null &&
    //   params.data.publish_creditmemo == "true"
    // ) {
    //   const appBuilderToken = await getOAuthToken(params);
    //   const eventResponse = await publishEventGeneric(
    //     params,
    //     logger,
    //     {
    //       message: "calling event from Test to Publish Credit Memo1.",
    //     },
    //     appBuilderToken,
    //     "fb268d42-683c-4b76-a9ca-946ff2649cf1",
    //     "ibm.sterling.adobe.creditmemo_process.v0",
    //   );
    //   return { response, eventResponse };
    // }
    return { response };
  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, "server error", logger);
  }
}

function wait(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

exports.main = main;
