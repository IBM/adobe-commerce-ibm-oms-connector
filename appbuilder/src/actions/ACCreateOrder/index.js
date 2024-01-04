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
const { getUserDetails } = require("../../auth/OMSAuthentication");
const { init, get, save } = require("../../config/StateStore");

const {
  createOrder,
  reserveAvailableInventory,
} = require("../../services/OMSService");
const {
  createOrderPayload,
  createReserveInventoryPayload,
} = require("../../models/order");
const { getResponse } = require("../../models/response");
const { STATUS } = require("../../config/constant");
const { getOAuthToken } = require("../../auth/AppBuilderAuth");
const { publishEvent } = require("../AppBuilderEvent");
const {
  getOauth,
  getAdobeOrderDetails,
  getTransactions,
} = require("../../services/AdobeCommerceService");

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });
  try {
    await init();

    // OMS login
    await logger.info("Calling Get Token");
    const userDetails = await getUserDetails(params);

    let updatedParams = params.data.value;
    let earliestScheduleDate = params.SCHEDULE_MINUTES_HOLD_OMS;

    let authExpirationSpan = params.PAYMENT_AUTHORIZATION_SPAN;

    if (
      (updatedParams.items &&
        updatedParams.addresses &&
        updatedParams.items.length === undefined) ||
      updatedParams.addresses.length === undefined
    ) {
      const resObj = {
        content: "Items and Address are not in correct format",
        status: "Adobe Payload is not correct",
      };
      let response = getResponse(resObj, STATUS.SUCCESS);
      return response;
    }

    const oauth = await getOauth(params, logger);

    if (updatedParams.shipping_method === "instore_pickup") {
      const orderDetails = await getAdobeOrderDetails(
        oauth,
        updatedParams.items[0].order_id,
      );

      updatedParams["nodeId"] =
        orderDetails.extension_attributes.pickup_location_code;

      updatedParams["reservationId"] =
        orderDetails.extension_attributes.oms_reservation_id;

      if (updatedParams.reservationId === undefined) {
        let res = {
          message: "Item Inventory does not exists in OMS",
        };
        let response = getResponse(res, STATUS.SUCCESS);
        return response;
      }
    }

    const txn_type = await get(String(params.data.value.items[0].order_id));
    if (!txn_type) {
      if (updatedParams.payment.transaction_id) {
        const transaction = await getTransactions(
          oauth,
          updatedParams.payment.transaction_id,
        );
        console.log("transaction", transaction);
        updatedParams["paymentType"] = transaction.txn_type;
        await save(params.data.value.items[0].order_id, transaction.txn_type);
      } else {
        updatedParams["paymentType"] = "";
      }
    } else {
      updatedParams["paymentType"] = txn_type;
    }

    const prepareOrderRequest = await createOrderPayload(
      updatedParams,
      userDetails,
      earliestScheduleDate,
      authExpirationSpan,
      params.HOLD_AMOUNT,
    );

    console.log(
      "JSON.stringify(orderResponse)",
      JSON.stringify(prepareOrderRequest),
    );

    if (!prepareOrderRequest.validPayload) {
      const resObj = {
        content: "Items and Address are not in correct format",
        status: "Adobe Payload is not correct",
      };
      let response = getResponse(resObj, STATUS.SUCCESS);
      return response;
    }

    //Create order OMS API call
    const orderResponse = await createOrder(
      params,
      userDetails,
      prepareOrderRequest.payload,
    );

    await logger.info("orderResponse", orderResponse);
    console.log("orderResponse", orderResponse);
    if (orderResponse.Status == STATUS.CREATED) {
      if (
        orderResponse.HoldFlag === "Y" ||
        prepareOrderRequest.payload.HoldFlag
      ) {
        // log the response status code
        logger.info(`${orderResponse.statusCode}: successful request`);
        const appBuilderToken = await getOAuthToken(params);
        const eventResponse = await publishEvent(
          params,
          logger,
          {
            orderId: orderResponse.OrderNo,
            comment: "Change Order Status to OnHold.",
          },
          appBuilderToken,
        );
        let response = getResponse(orderResponse, STATUS.SUCCESS);
        response["event"] = eventResponse;
        return response;
      } else {
        const response = getResponse(orderResponse, STATUS.SUCCESS);
        return response;
        // return errorResponse(500, 'server error :' + JSON.stringify(orderResponse), logger)
      }
    } else {
      // log the response status code
      const response = getResponse(orderResponse, STATUS.SUCCESS);
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
