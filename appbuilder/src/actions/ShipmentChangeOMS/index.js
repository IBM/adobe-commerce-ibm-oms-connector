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
const { errorResponse, stringParameters } = require("../utils");
const {
  changeShipment,
  confirmShipment,
  cancelRemainingQty,
} = require("../../services/OMSService");
const { init } = require("../../config/StateStore");
const { getUserDetails } = require("../../auth/OMSAuthentication");
const {
  shipmentPayload,
  confirmShipmentPayload,
  cancelShipmentQtyPayload,
} = require("../../models/order");

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });

  try {
    await init();

    // 'info' is the default level if not set
    logger.info("Calling the main action");

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params));

    //Prepare user data for shipment
    const userDetails = await getUserDetails(params);
    const { type } = params.data;
    // const oauth = await getOauth(params, logger)

    let result;

    if (type === "create") {
      const payload = await shipmentPayload(params, userDetails);
      result = await changeShipment(params, userDetails, payload);
    } else if (type === "confirm") {
      const payload = await confirmShipmentPayload(params, userDetails);
      result = await confirmShipment(params, userDetails, payload);
    } else if (type === "cancel") {
      const payload = await cancelShipmentQtyPayload(params, userDetails);
      result = await cancelRemainingQty(params, userDetails, payload);
    }

    const response = {
      statusCode: 200,
      body: result,
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
