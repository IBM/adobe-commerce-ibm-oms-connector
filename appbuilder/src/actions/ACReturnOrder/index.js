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
const { getUserDetails } = require("../../auth/OMSAuthentication");
const {
  returnOrderPayload,
  changeOrderStatusPayload,
  startReceiptPayload,
  findReceiptPayload,
  receiveOrderPayload,
  closeReceiptPayload,
  cancelOrderPayload,
  memoACPayload,
  startReceiptPayloadMultiNode,
  receiveOrderPayloadMultiNode,
  closeReceiptPayloadultiNode,
} = require("../../models/order");
const {
  getOMSOrderDetails,
  createOrder,
  changeOrderStatus,
  getOMSReturnOrderDetails,
  startReceipt,
  findReceipt,
  receiveOrder,
  closeReceipt,
  cancelOrderOMS,
  createOrderAPI,
} = require("../../services/OMSService");
const { getResponse } = require("../../models/response");
const { RETURN_STATUS, STATUS } = require("../../config/constant");
const {
  createACReturnMemo,
  getOauth,
  orderInAdobe,
  getInvoice,
  getCreditMemos,
  getReturn,
  getAdobeOrderDetails,
} = require("../../services/AdobeCommerceService");
const { init, get, save } = require("../../config/StateStore");

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });

  try {
    await init();
    const oauth = await getOauth(params, logger);

    // 'info' is the default level if not set
    logger.info("Calling the main action 23332323 : " + params.data.value);

    // log parameters, only if params.LOG_LEVEL === 'debu'g
    // logger.debug(stringParameters(params));
    const { status, comments, items } = params.data.value;

    const userDetails = await getUserDetails(params);

    if (status === RETURN_STATUS.PENDING && comments.length === 0) {
      const omsOrderDetail = await getOMSOrderDetails(
        params,
        userDetails,
        params.data.value.order_id,
      );
      const adobeOrderDetails = await orderInAdobe(
        oauth,
        params.data.value.order_id,
      );
      const returnPayload = await returnOrderPayload(
        params,
        omsOrderDetail[0],
        logger,
        adobeOrderDetails[0].shipping_incl_tax,
        adobeOrderDetails[0].discount_amount,
      );
      await logger.info("returnPayload" + JSON.stringify(returnPayload));
      const orderResponse = await createOrderAPI(
        params,
        userDetails,
        returnPayload,
      );
      const response = getResponse(orderResponse, STATUS.SUCCESS);
      return response;
    } else if (status === RETURN_STATUS.AUTHORIZED) {
      const omsOrderDetail = await getOMSReturnOrderDetails(
        params,
        userDetails,
        params.data.value.entity_id,
      );

      const statusPayload = await changeOrderStatusPayload(
        params,
        omsOrderDetail[0],
        "authorized",
        logger,
      );
      await logger.info("status payload" + JSON.stringify(statusPayload));
      const changeOrderResponse = await changeOrderStatus(
        params,
        userDetails,
        statusPayload,
      );
      const response = getResponse(changeOrderResponse, STATUS.SUCCESS);
      return response;
    } else if (status === RETURN_STATUS.RECEIVED) {
      logger.info("1 Status", status);

      const omsReturnOrderDetail = await getOMSReturnOrderDetails(
        params,
        userDetails,
        params.data.value.entity_id,
      );
      logger.info(
        "omsReturnOrderDetail : " + JSON.stringify(omsReturnOrderDetail),
      );
      let hasDifferentShipNode = false;
      if (omsReturnOrderDetail[0].OrderLines.OrderLine.length > 1) {
        omsReturnOrderDetail[0].OrderLines.OrderLine.forEach((element) => {
          if (
            omsReturnOrderDetail[0].OrderLines.OrderLine[0].ShipNode !=
            element.ShipNode
          ) {
            if (!hasDifferentShipNode) hasDifferentShipNode = true;
          }
        });
      }
      if (hasDifferentShipNode) {
        let startReceiptList = [];
        let index = 0;
        let receiveOrders = [];
        await Promise.all(
          omsReturnOrderDetail[0].OrderLines.OrderLine.map(async (element) => {
            index = index + 1;
            const startRecPayload = await startReceiptPayloadMultiNode(
              params,
              omsReturnOrderDetail[0],
              element.ShipNode,
              index,
            );
            logger.info("startRecPayload : " + JSON.stringify(startRecPayload));
            const responseReceipt = await startReceipt(
              params,
              userDetails,
              startRecPayload,
            );
            logger.info(
              "startRec response : " + JSON.stringify(responseReceipt),
            );

            const receivePayload = await receiveOrderPayloadMultiNode(
              params,
              omsReturnOrderDetail[0],
              responseReceipt,
              logger,
              element,
            );
            logger.info("receivePayload : " + JSON.stringify(receivePayload));

            const receiveOrderResponse = await receiveOrder(
              params,
              userDetails,
              receivePayload,
            );

            const closeRecPayload = await closeReceiptPayloadultiNode(
              omsReturnOrderDetail[0],
              responseReceipt,
            );
            logger.info("closeRecPayload : " + JSON.stringify(closeRecPayload));

            await closeReceipt(params, userDetails, closeRecPayload);

            startReceiptList.push(responseReceipt);
            receiveOrders.push(receiveOrderResponse);
          }),
        );
        const response = getResponse(
          { startReceiptList, receiveOrders },
          STATUS.SUCCESS,
        );
        return response;
      } else {
        const findRecPayload = await findReceiptPayload(
          params,
          omsReturnOrderDetail[0],
        );
        logger.info("findRecPayload : " + JSON.stringify(findRecPayload));
        const findReceiptResp = await findReceipt(
          params,
          userDetails,
          findRecPayload,
        );
        logger.info("findReceiptResp : " + JSON.stringify(findReceiptResp));

        let startReceiptResp =
          parseInt(findReceiptResp.TotalNumberOfRecords) > 0
            ? findReceiptResp.Receipt[0]
            : {};
        logger.info("startReceiptResp : " + JSON.stringify(startReceiptResp));

        if (parseInt(findReceiptResp.TotalNumberOfRecords) === 0) {
          const startRecPayload = await startReceiptPayload(
            params,
            omsReturnOrderDetail[0],
          );
          logger.info("startRecPayload : " + JSON.stringify(startRecPayload));
          startReceiptResp = await startReceipt(
            params,
            userDetails,
            startRecPayload,
          );
        }

        const receivePayload = await receiveOrderPayload(
          params,
          omsReturnOrderDetail[0],
          startReceiptResp,
          logger,
        );
        logger.info("receivePayload : " + JSON.stringify(receivePayload));

        await receiveOrder(params, userDetails, receivePayload);

        const closeRecPayload = await closeReceiptPayload(
          omsReturnOrderDetail[0],
          startReceiptResp,
        );
        logger.info("closeRecPayload : " + JSON.stringify(closeRecPayload));

        await closeReceipt(params, userDetails, closeRecPayload);
        const response = getResponse(
          { startReceiptResp, receivePayload, closeRecPayload },
          STATUS.SUCCESS,
        );
        return response;
      }
    } else if (status === RETURN_STATUS.CLOSED) {
      let orderObj = {
        OrderNo: params.data.value.entity_id,
      };

      logger.info("orderObj: " + JSON.stringify(orderObj));

      const omsOrderDetail = await getOMSReturnOrderDetails(
        params,
        userDetails,
        params.data.value.order_id,
      );
      logger.info("omsOrderDetail: " + JSON.stringify(omsOrderDetail));

      const unreceivePayload = await changeOrderStatusPayload(
        params,
        omsOrderDetail[0],
        "unreceive",
        logger,
      );
      logger.info("unreceivePayload1: " + JSON.stringify(unreceivePayload));

      const orderResp = await changeOrderStatus(
        params,
        userDetails,
        unreceivePayload,
      );
      logger.info("orderResp: " + JSON.stringify(orderResp));

      const data = await cancelOrderPayload(orderObj, userDetails, "0003");
      logger.info("data: " + JSON.stringify(data));

      const resp = await cancelOrderOMS(params, userDetails, data);
      logger.info("resp: " + JSON.stringify(resp));

      const response = getResponse(resp, STATUS.SUCCESS);
      return response;
    } else if (status === RETURN_STATUS.PROCESSED_CLOSED) {
      const omsReturnOrderDetail = await getOMSReturnOrderDetails(
        params,
        userDetails,
        params.data.value.entity_id,
      );

      if (
        omsReturnOrderDetail &&
        omsReturnOrderDetail[0].Status != "Restocked"
      ) {
        const oauth = await getOauth(params, logger);
        const returnData = await getReturn(oauth, params.data.value.entity_id);
        const previousStatus = returnData.comments.filter(
          (item) => item.status === "received",
        );
        if (previousStatus.length > 0) {
          const creditMemos = await getCreditMemos(
            oauth,
            params.data.value.order_id,
          );
          const adobeOrder = await orderInAdobe(
            oauth,
            params.data.value.order_id,
          );

          const invoice = await getInvoice(oauth, params.data.value.order_id);

          //if (creditMemos.length === 0 || invoice.length.items > 1) {
          if (invoice && invoice.items.length > 0) {
            let responses = [];
            await Promise.all(
              invoice.items.map(async (element) => {
                const memoPayload = await memoACPayload(
                  adobeOrder,
                  element,
                  "CREDITMEMO_FOR_RETURN",
                );
                console.log("element", element);
                console.log("memoPayload", memoPayload);

                let resp = await createACReturnMemo(
                  oauth,
                  memoPayload,
                  element.entity_id,
                );
                console.log("resp", resp);

                responses.push(resp);
              }),
            );
            const response = getResponse(responses, STATUS.SUCCESS);
            return response;
          }
          //}
        } else {
          return errorResponse(
            500,
            "This request will process after return order is received.",
            logger,
          );
        }
      } else {
        return errorResponse(
          200,
          "Order status is Restocked and already been processed.",
          logger,
        );
      }
    }

    const response = {
      statusCode: 200,
      body: params,
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
