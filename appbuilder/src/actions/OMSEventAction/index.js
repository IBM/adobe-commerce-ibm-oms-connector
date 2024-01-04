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
const { OMS_EVENTS } = require("../../config/constant");
const { errorResponse, stringParameters } = require("../utils");
const OMSTest = require("../OMSTest/index");
const OrderStatusChange = require("../OrderStatusChange/index");
const ShipmentRequest = require("../ShipmentRequest/index");
const ShipmentShippedAC = require("../ShipmentShippedAC/index");
const StockSync = require("../StockSync/index");
const ShipmentChangeAC = require("../ShipmentChangeAC/index");
const OrderMonitor = require("../OrderMonitor/index");
const BackOrder = require("../BackOrder/index");
const PaymentExecution = require("../PaymentExecution/index");

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger("OMSEventAction Main", {
    level: params.LOG_LEVEL || "info",
  });

  try {
    // 'info' is the default level if not set
    logger.info("Calling the main action");
    if (params.type == OMS_EVENTS.TEST) {
      const response = await OMSTest.main(params);
      return response;
    } else if (params.type == OMS_EVENTS.ORDER_STATUS_CHANGE) {
      const response = await OrderStatusChange.main(params, logger);
      return response;
    } else if (params.type == OMS_EVENTS.SHIPMENT_REQUEST) {
      const response = await ShipmentRequest.main(params, logger);
      return response;
    } else if (params.type == OMS_EVENTS.SHIPMENT_SHIPPED) {
      const response = await ShipmentShippedAC.main(params, logger);
      return response;
    } else if (params.type == OMS_EVENTS.STOCK_CHANGE) {
      const response = await StockSync.main(params, logger);
      return response;
    } else if (params.type == OMS_EVENTS.SHIPMENT_CHANGE) {
      const response = await ShipmentChangeAC.main(params, logger);
      return response;
    } else if (params.type == OMS_EVENTS.ORDER_MONITOR) {
      const response = await OrderMonitor.main(params, logger); //This is for Shipment and Order Monitoring both event
      //Below are the event from OMS which we need to listen here
      // ORDER_MONITOR_EX.CREATE_SHIP_DELAY
      // ORDER_MONITOR_EX.FIRST_SHIP_DELAY
      // ORDER_MONITOR_EX.NEXT_SHIP_DELAY
      // ORDER_MONITOR_EX.FINAL_SHIP_DELAY
      // ORDER_MONITOR_EX.0003.RETURN_ORDER_DELAY
      return response;
    } else if (params.type == OMS_EVENTS.BACK_ORDER) {
      const response = await BackOrder.main(params, logger);
      //Below are the two event from OMS need to listen
      //RELEASE.0001.ON_BACKORDER
      //RELEASE.0001.ON_RELEASE_CREATION_OR_CHANGE

      return response;
    } else if (params.type == OMS_EVENTS.PAYMENT_EXECUTION) {
      const response = await PaymentExecution.main(params, logger);
      return response;
    } else {
      // log parameters, only if params.LOG_LEVEL === 'debug'
      logger.debug(stringParameters(params));
      const content = params.type + " : EVENT NAME NOT DETECTED";
      const response = {
        statusCode: 200,
        body: params,
        message: content,
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
