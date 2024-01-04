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

const { Core } = require("@adobe/aio-sdk");
const { AC_EVENTS } = require("../../config/constant");
const { errorResponse, stringParameters } = require("../utils");
const ACCreateOrder = require("../ACCreateOrder/index");
const ACReturnOrder = require("../ACReturnOrder");
const ACCreditMemo = require("../ACCreditMemo");
const ACOrderInvoice = require("../ACOrderInvoice");
const { publishEventGeneric } = require("../AppBuilderEvent");
const { getOAuthToken } = require("../../auth/AppBuilderAuth");
const { RETURN_STATUS, STATUS } = require("../../config/constant");

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger("ACEventAction Main", {
    level: params.LOG_LEVEL || "info",
  });

  try {
    // 'info' is the default level if not set
    logger.info(
      "Calling the main action",
      params.type,
      params.type === AC_EVENTS.RETURN,
    );
    if (params.type == AC_EVENTS.SAVE) {
      const response = await ACCreateOrder.main(params);
      return response;
    } else if (params.type == AC_EVENTS.RETURN) {
      const { status, comments } = params.data.value;
      if (
        // (status === RETURN_STATUS.PENDING && comments.length === 0) ||
        status === RETURN_STATUS.AUTHORIZED ||
        status === RETURN_STATUS.RECEIVED ||
        status === RETURN_STATUS.CLOSED
      ) {
        const token = await getOAuthToken(params);
        const eventResponse = await publishEventGeneric(
          params,
          logger,
          {
            params: params,
            type: AC_EVENTS.RETURN,
          },
          token,
          "fb268d42-683c-4b76-a9ca-946ff2649cf1",
          "ibm.sterling.adobe.creditmemo_process.v0",
        );
        return eventResponse;
      } else {
        const response = await ACReturnOrder.main(params);
        return response;
      }
    } else if (params.type == AC_EVENTS.CREDIT_MEMO) {
      //const response = await ACCreditMemo.main(params);
      const token = await getOAuthToken(params);
      const eventResponse = await publishEventGeneric(
        params,
        logger,
        { type: AC_EVENTS.CREDIT_MEMO, params: params },
        token,
        "fb268d42-683c-4b76-a9ca-946ff2649cf1",
        "ibm.sterling.adobe.creditmemo_process.v0",
      );
      return eventResponse;
    } else if (params.type == AC_EVENTS.INVOICE) {
      const response = await ACOrderInvoice.main(params);
      return response;
    } else {
      // log parameters, only if params.LOG_LEVEL === 'debug'
      logger.debug(stringParameters(params));
      const content = params.type + " : EVENT NAME NOT DETECTED";
      const response = {
        statusCode: 200,
        body: {
          message: content,
        },
      };
      // log the response status code
      logger.info(`${response.statusCode}: successful request`);
      return response;
    }
  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, "server error for event," + params.type, logger);
  }
}

exports.main = main;
