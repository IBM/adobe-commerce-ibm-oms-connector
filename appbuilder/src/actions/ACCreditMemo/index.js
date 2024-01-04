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
const {
  getAdobeOrderDetails,
  getOauth,
  orderInAdobe,
  getReturns,
} = require("../../services/AdobeCommerceService");
const { errorResponse } = require("../utils");
const { getUserDetails } = require("../../auth/OMSAuthentication");
const {
  changeOrderStatusMemoPayload,
  changeOrderCreditPayload,
  generateInvoicePayload,
  recordInvoiceCreationMemoPayload,
  recordExternalChargesPayload,
} = require("../../models/order");
const {
  changeOrder,
  getOMSOrderDetails,
  createOrderInvoice,
  changeOrderStatus,
  getOMSReturnOrderDetails,
  recordInvoiceCreation,
  recordExternalCharges,
} = require("../../services/OMSService");

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });

  try {
    // 'info' is the default level if not set
    logger.info("Calling the main action : " + JSON.stringify(params));
    const { comments } = params.data.value;
    let order_id = "";

    if (params.data.value.invoice) {
      order_id = params.data.value.invoice.order_id;
    } else {
      order_id = params.data.value.order_id;
    }
    logger.info("order_id: " + order_id);

    const oauth = await getOauth(params, logger);
    const userDetails = await getUserDetails(params);
    logger.info("userDetails: " + JSON.stringify(userDetails));

    // const adobeOrder = await orderInAdobe(oauth, order_id);
    const adobeOrder = await getAdobeOrderDetails(oauth, order_id);
    logger.info("adobeOrder: " + JSON.stringify(adobeOrder));

    const returnMemo = comments.filter(
      (item) => item.comment === "CREDITMEMO_FOR_RETURN",
    );
    logger.info("returnMemo: " + JSON.stringify(returnMemo));

    if (returnMemo.length > 0) {
      const returns = await getReturns(oauth, order_id);
      let entity_id = returns[0].entity_id;
      logger.info("returns: " + JSON.stringify(returns));

      if (returns.length > 1) {
        const returnItem = returns.filter((item) => item.status != "closed");
        logger.info("returnItem: " + JSON.stringify(returnItem));
        entity_id = returnItem[0].entity_id;
      }

      //API 1 getOMSReturnOrderDetails
      const omsReturnOrderDetail = await getOMSReturnOrderDetails(
        params,
        userDetails,
        entity_id,
      );
      logger.info(
        "omsReturnOrderDetail: " + JSON.stringify(omsReturnOrderDetail),
      );

      const statusPayload = await changeOrderStatusMemoPayload(
        params,
        omsReturnOrderDetail[0],
        "approved",
      );
      logger.info("statusPayload: " + JSON.stringify(statusPayload));

      //API 2 changeOrderStatus
      await changeOrderStatus(params, userDetails, statusPayload);

      //Okay till above

      const changeOrdPayload = await changeOrderCreditPayload(
        params,
        userDetails,
        omsReturnOrderDetail[0],
        adobeOrder,
      );
      logger.info("changeOrdPayload: " + JSON.stringify(changeOrdPayload));

      //API 2 changeOrder
      await changeOrder(params, userDetails, changeOrdPayload);

      const invoicePayload = await generateInvoicePayload(
        params,
        omsReturnOrderDetail[0],
      );
      logger.info("invoicePayload: " + JSON.stringify(invoicePayload));

      //API 3 createOrderInvoice
      await createOrderInvoice(params, userDetails, invoicePayload);

      const memoOMSPayload = await await changeOrderStatusMemoPayload(
        params,
        omsReturnOrderDetail[0],
        "createMemo",
      );
      logger.info("memoOMSPayload: " + JSON.stringify(memoOMSPayload));

      //API 4 changeOrderStatus

      await changeOrderStatus(params, userDetails, memoOMSPayload);

      const restockResp = await changeOrderStatusMemoPayload(
        params,
        omsReturnOrderDetail[0],
        "restock",
      );
      logger.info("restockResp: " + JSON.stringify(restockResp));

      const orderResp = await changeOrderStatus(
        params,
        userDetails,
        restockResp,
      );
      logger.info("orderResp: " + JSON.stringify(orderResp));

      const response = {
        statusCode: 200,
        body: orderResp,
      };

      // log the response status code
      logger.info(`${response.statusCode}: successful request`);
      return response;
    } else {
      const userDetails1 = await getUserDetails(params, true);

      const omsOrderDetail = await getOMSOrderDetails(
        params,
        userDetails1,
        order_id,
      );
      logger.info("else part initiated");

      logger.info("omsOrderDetail: " + JSON.stringify(omsOrderDetail));

      let data = await recordInvoiceCreationMemoPayload(
        params.data.value,
        userDetails1,
        omsOrderDetail[0],
      );
      logger.info("data: " + JSON.stringify(data));

      let recordCreationResponse = await recordInvoiceCreation(
        params,
        userDetails1,
        data,
      );
      logger.info(
        "recordCreationResponse: " + JSON.stringify(recordCreationResponse),
      );

      let adobeOrderDetails = await getAdobeOrderDetails(oauth, order_id);
      logger.info("adobeOrderDetails: " + JSON.stringify(adobeOrderDetails));
      let recordingPayment = await recordExternalChargesPayload(
        params,
        userDetails1,
        adobeOrderDetails,
        order_id,
        "OTHER",
      );
      logger.info("recordingPayment: " + JSON.stringify(recordingPayment));

      let recordExternalChrg = await recordExternalCharges(
        params,
        userDetails1,
        recordingPayment,
      );
      logger.info("recordExternalChrg: " + JSON.stringify(recordExternalChrg));

      const backorderMemo = comments.filter(
        (item) => item.comment === "CREDITMEMO_FOR_BACKORDER_CANCEL",
      );
      console.log("backorderMemo", backorderMemo);
      if (backorderMemo.length > 0) {
        //TODO: CANCEL ORDER Cancel Order Item or full cancel
      }

      const response = {
        statusCode: 200,
        body: recordExternalChrg,
        event_type: "Order Credit Memo Event",
      };
      logger.info(`${response.statusCode}: successful request`);
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
