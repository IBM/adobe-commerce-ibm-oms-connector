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

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });

  try {
    // 'info' is the default level if not set
    logger.info("Calling the main action");

    let desc = params.data.MonitorConsolidation.Description;
    const date = params.data.MonitorConsolidation.Order.OrderDate;
    const orderNo = params.data.MonitorConsolidation.Order.OrderNo;
    const orderStatus = params.data.MonitorConsolidation.Order.Status;
    let message = "";
    if ((desc = "Create Shipment Delay Alert")) {
      message = "Order has been in Released for 48 elapsed hours,";
    } else if ((desc = "First Shipment Delay Alert")) {
      message =
        "Order has not reached Order line completely shipped within 24 elapsed hours of Requested Ship Date";
    } else if ((desc = "Next Shipment Delay Alert")) {
      message =
        "Order has not reached Order line completely shipped within 48 elapsed hours of Requested Ship Date";
    } else if ((desc = "Final Shipment Delay Alert")) {
      message =
        "Order has not reached Order line completely shipped within 72 elapsed hours of Requested Ship Date";
    }

    const result = {
      orderNo: orderNo,
      date: date,
      orderNo: orderNo,
      orderStatus: orderStatus,
      message: message,
    };

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
