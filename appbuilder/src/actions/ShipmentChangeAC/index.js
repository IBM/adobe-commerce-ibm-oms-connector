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
const { errorResponse } = require("../utils");
const {
  getOrderStatusAC,
  getOauth,
  addCommentAC,
  orderInAdobe,
} = require("../../services/AdobeCommerceService");

// main function that will be executed by Adobe I/O Runtime
async function main(params, log) {
  let logger = log;
  if (!logger) {
    // create a Logger
    logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });
  }

  try {
    // 'info' is the default level if not set
    logger.info("Calling the ShipmentChange action");
    const Shipment = params?.data?.Shipment;
    const oauth = await getOauth(params, logger);
    const orderNo = Shipment.ShipmentLines.ShipmentLine[0].Order
      ? Shipment.ShipmentLines.ShipmentLine[0].Order.OrderNo
      : Shipment.ShipmentLines.ShipmentLine[0].OrderNo;

    const orders = await orderInAdobe(oauth, orderNo);
    if (orders.length === 0) {
      const response = {
        statusCode: 200,
        body: {
          orderId: orderNo,
          message: "Order does not exist in Adobe Commerce",
        },
      };
      return response;
    }

    const status = await getOrderStatusAC(oauth, orderNo);

    if (
      Shipment?.YFSTranEventID === "YCD_BACKROOM_PICK.ON_SUCCESS" &&
      Shipment?.Status === "1100.70.06.30"
    ) {
      const commentResponse = await addCommentAC(
        oauth,
        orderNo,
        status,
        "Ready For Customer Pickup",
      );
      const response = {
        statusCode: 200,
        body: commentResponse,
      };
      return response;
    } else if (
      Shipment?.YFSTranEventID === "CREATE_SHIPMENT.ON_SUCCESS" &&
      Shipment?.Status === "1100"
    ) {
      const commentResponse = await addCommentAC(
        oauth,
        orderNo,
        status,
        "Shipment is created for the order.",
      );
      const response = {
        statusCode: 200,
        body: commentResponse,
      };
      return response;
    }
  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, "server error", logger);
  }
}

exports.main = main;
