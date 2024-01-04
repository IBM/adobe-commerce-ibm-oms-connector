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
  orderShipped,
  notifyOrderReadyForPickup,
  getOauth,
  orderInAdobe,
  getAdobeOrderDetails,
  createInvoice,
  getTransactions,
} = require("../../services/AdobeCommerceService");
const { get, save, init, remove } = require("../../config/StateStore");
// const { getOMSOrderDetails } = require("../../services/OMSService");
// const { getUserDetails } = require("../../auth/OMSAuthentication");

// main function that will be executed by Adobe I/O Runtime
async function main(params, log) {
  let logger = log;
  if (!logger) {
    // create a Logger
    logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });
  }
  const isShipmentProcessKey = "SHIPMENTNO_" + params.data.Shipment.ShipmentNo;
  try {
    await init();

    // var txn_type1 = await get("1312");
    // logger.info("txn_type1 :" + txn_type1);
    // return txn_type1;

    // 'info' is the default level if not set
    logger.info("Calling the main action");
    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params));
    const oauth = await getOauth(params, logger);

    let shipmentProcess = true;
    let isShipmentProcessAvailable = await get(isShipmentProcessKey);
    if (isShipmentProcessAvailable && isShipmentProcessAvailable == true) {
      shipmentProcess = false;
    } else {
      shipmentProcess = true;
      // await save("RECORD_CHARGES_" + orderId, true);
    }
    if (shipmentProcess) {
      let shipmentLinesData = params.data.Shipment.ShipmentLines.ShipmentLine;
      let orderId = params.data.Shipment.ShipmentLines.ShipmentLine[0].OrderNo;
      let adobeOrderDetails = await getAdobeOrderDetails(oauth, orderId);
      await save(isShipmentProcessKey, true);

      logger.info(
        "status for shipment" + JSON.stringify(adobeOrderDetails.status),
      );
      let order_item_idArray = adobeOrderDetails.items;
      let order_obj = [];

      shipmentLinesData.map((item) => {
        let selectedOrder = order_item_idArray.filter(
          (i) => i.product_id == item.ItemID,
        );
        logger.info("selectedOrder" + JSON.stringify(selectedOrder));
        logger.info(
          "selectedOrder[0].ItemID" + JSON.stringify(selectedOrder[0].item_id),
        );

        if (selectedOrder.length > 0) {
          order_obj.push({
            order_item_id: selectedOrder[0].item_id,
            qty: item.Quantity,
          });
        }
      });

      const requestBody = JSON.stringify({
        items: order_obj,
        arguments: {
          extension_attributes: {
            source_code: params.data.Shipment.ShipNode,
          },
        },
      });
      logger.info("requestBody" + JSON.stringify(requestBody));
      if (adobeOrderDetails.statusCode == 404) {
        await remove(isShipmentProcessKey);
        const response = {
          statusCode: 200,
          body: {
            orderId,
            message: "Order does not exist in Adobe Commerce",
            requestBody,
          },
        };
        return response;
      }

      let orderShippedResponse;
      //console.log('requestBody',requestBody)

      if (
        params.data.Shipment.ShipmentLines.ShipmentLine[0]?.OrderLine
          ?.DeliveryMethod === "PICK"
      ) {
        if (adobeOrderDetails.status != "complete") {
          orderShippedResponse = await notifyOrderReadyForPickup(
            oauth,
            orderId,
          );
          await save(isShipmentProcessKey, true);
        } else {
          await remove(isShipmentProcessKey);
          const response = {
            statusCode: 200,
            body: {
              orderId: orderId,
              message:
                "Trying to create Shipment for Order Ready For Pickup,It won't process because Order is in Complete Status",
              requestBody,
            },
          };
          return response;
        }
      } else {
        if (adobeOrderDetails.status != "complete") {
          orderShippedResponse = await orderShipped(
            oauth,
            orderId,
            requestBody,
          );
          await save(isShipmentProcessKey, true);
        } else {
          await remove(isShipmentProcessKey);
          const response = {
            statusCode: 200,
            body: {
              orderId: orderId,
              message:
                "Trying to create Shipment,It won't process because Order is in Complete Status",
              requestBody,
            },
          };
          return response;
        }
      }
      logger.info(
        "orderShippedResponse in shipmentShipped" +
          JSON.stringify(orderShippedResponse),
      );
      let invoiceResponse = { isInInvoice: false };
      if (
        orderShippedResponse.statusCode == 200 ||
        orderShippedResponse.successful
      ) {
        invoiceResponse.isInInvoice = true;
        // let trxnId = resp.payment.cc_trans_id;
        // logger.info("trxnId :" + trxnId);
        // let checkAuthorised = await getTransactions(oauth, trxnId);
        // console.log("checkAuthorised", checkAuthorised);
        var txn_type = await get(String(orderId));
        logger.info("txn_type :" + txn_type);
        invoiceResponse.txn = txn_type;
        if (
          (txn_type != undefined && txn_type == "authorization") ||
          adobeOrderDetails.payment.method == "checkmo"
        ) {
          if (adobeOrderDetails.status != "complete") {
            let invoiceRes = await createInvoice(orderId, oauth, order_obj);
            logger.info("Invoice Response:" + invoiceRes);
            invoiceResponse.response = invoiceRes;
          } else {
            await remove(isShipmentProcessKey);
            const response = {
              statusCode: 200,
              body: {
                orderId: orderId,
                message:
                  "Trying to create Invoice, It won't process because order is in complete Status",
                requestBody,
              },
            };
            return response;
          }
        } else {
          invoiceResponse.message = "Transaction didn't find to process.";
        }
      }
      if (
        orderShippedResponse.statusCode == 200 ||
        orderShippedResponse.successful
      ) {
        await remove(isShipmentProcessKey);
      }
      const response = {
        statusCode: 200,
        body: {
          apiResponse: orderShippedResponse,
          request: requestBody,
          invoice: invoiceResponse,
        },
      };
      // log the response status code
      logger.info(`${response.statusCode}: successful request`);
      return response;
    } else {
      await remove(isShipmentProcessKey);
      const response = {
        statusCode: 200,
        body: {
          message:
            "Shipment with " +
            isShipmentProcessKey +
            "is already been processed",
        },
      };
      return response;
    }
  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    await remove(isShipmentProcessKey);
    return errorResponse(500, "server error", logger);
  }
}

exports.main = main;
