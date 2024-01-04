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
const {
  getOauth,
  cancelOrderAC,
  addPaymentComment,
  getOrderStatusAC,
} = require("../../services/AdobeCommerceService");
const { ADOBE_STATUS, STATUS_COMMENTS } = require("../../config/constant");

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
    const oauth = await getOauth(params, logger);
    const orderId = await params.data.Order.OrderNo;
    const adobeStatus = await getOrderStatusAC(oauth, orderId);

    //Right now we have added comment on Order level for payment mismatch, if you wanted to extend this please do write logic here.
    const commentResponse = await addPaymentComment(
      oauth,
      orderId,
      adobeStatus,
      STATUS_COMMENTS.PAYMENT_MISMATCH,
      0,
      0,
    );

    if (commentResponse) {
      const response = {
        statusCode: 200,
        event_type: "Payment Execution Event",
        body: params,
      };
      return response;
    } else {
      return errorResponse(
        500,
        "server error, problem in comment response",
        logger,
      );
    }
  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, "server error", logger);
  }
}

exports.main = main;
