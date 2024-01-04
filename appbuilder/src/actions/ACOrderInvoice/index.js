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
const { getUserDetails } = require("../../auth/OMSAuthentication");
const {
  recordInvoiceCreationPayload,
  recordExternalChargesPayload,
} = require("../../models/order");
const {
  recordInvoiceCreation,
  getOMSOrderDetails,
  recordExternalCharges,
} = require("../../services/OMSService");
const {
  getAdobeOrderDetails,
  getOauth,
  getTransactions,
} = require("../../services/AdobeCommerceService");
const { init, get, save, remove } = require("../../config/StateStore");

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });

  try {
    await init();
    // 'info' is the default level if not set
    logger.info("Calling the invoice action : " + JSON.stringify(params));
    const oauth = await getOauth(params, logger);
    const txn_type = await get(String(params.data.value.order_id));
    const isOMSChargesAvailableKey =
      "RECORDED_CHARGES_" +
      params.data.value.increment_id +
      "_" +
      params.data.value.order_id;

    let processOMSCharges = true;
    let isOMSChargesAvailable = await get(isOMSChargesAvailableKey);
    if (isOMSChargesAvailable && isOMSChargesAvailable == true) {
      processOMSCharges = false;
    } else {
      processOMSCharges = true;
      // await save("RECORD_CHARGES_" + orderId, true);
    }

    if (processOMSCharges) {
      // const transaction = await getTransactions(
      //   oauth,
      //   params.data.value.transaction_id,
      // );
      // logger.info("transaction", transaction);

      const userDetails = await getUserDetails(params, true);
      logger.info("userDetails" + JSON.stringify(userDetails));
      if (
        userDetails != null &&
        userDetails != undefined &&
        userDetails.token != null &&
        userDetails.token != undefined
      ) {
        const omsOrderDetail = await getOMSOrderDetails(
          params,
          userDetails,
          params.data.value.order_id,
        );
        logger.info("omsOrderDetail" + JSON.stringify(omsOrderDetail));
        if (omsOrderDetail && omsOrderDetail.length > 0) {
          let orderId = omsOrderDetail[0]?.OrderNo;
          let adobeOrderDetails = await getAdobeOrderDetails(oauth, orderId);

          let data = await recordInvoiceCreationPayload(
            params.data.value,
            omsOrderDetail[0],
          );
          logger.info(
            "recordInvoiceCreationPayload.data" + JSON.stringify(data),
          );

          let recordCreationResponse = await recordInvoiceCreation(
            params,
            userDetails,
            data,
          );
          logger.info(
            "recordCreationResponse" + JSON.stringify(recordCreationResponse),
          );
          if (
            txn_type === "authorization" ||
            adobeOrderDetails.payment.method == "checkmo"
          ) {
            if (processOMSCharges) {
              logger.info(
                "adobeOrderDetails" + JSON.stringify(adobeOrderDetails),
              );
              let recordingPayment = await recordExternalChargesPayload(
                params,
                userDetails,
                adobeOrderDetails,
                orderId,
                "memo",
              );
              logger.info(
                "recordingPayment" + JSON.stringify(recordingPayment),
              );
              await save(isOMSChargesAvailableKey, true);
              let recordExternalChrg = await recordExternalCharges(
                params,
                userDetails,
                recordingPayment,
              );
              logger.info(
                "recordExternalChrg" + JSON.stringify(recordExternalChrg),
              );
              if (recordExternalChrg != null) {
                await save(isOMSChargesAvailableKey, true);
              } else {
                await remove(isOMSChargesAvailableKey);
              }

              //console.log("recordExternalChrg",recordExternalChrg)
              const response = {
                statusCode: 200,
                body: {
                  _processOMSCharges: processOMSCharges,
                  _isOMSChargesAvailable: isOMSChargesAvailable,
                  //recordExternalChrg,
                  event_type: "Order Invoice Event with Authorized State",
                  message: "Pro Forma Invoice Created with Charged.",
                  transaction_type: txn_type,
                  authorizationID:
                    recordingPayment.PaymentMethod.PaymentDetailsList
                      .PaymentDetails.AuthorizationID,
                },
              };
              logger.info(`${response.statusCode}: successful request`);
              return response;
            } else {
              await remove(isOMSChargesAvailableKey);
              const response = {
                statusCode: 200,
                body: {
                  _processOMSCharges: processOMSCharges,
                  _isOMSChargesAvailable: isOMSChargesAvailable,
                  //recordCreationResponse,
                  transaction_type: txn_type,
                  event_type: "OMS Invoice Charges",
                  message: "OMS Charges has already been processed.",
                },
              };
              return response;
            }
          } else {
            await remove(isOMSChargesAvailableKey);
            const response = {
              statusCode: 200,
              body: {
                _processOMSCharges: processOMSCharges,
                _isOMSChargesAvailable: isOMSChargesAvailable,
                //recordCreationResponse,
                transaction_type: txn_type,
                event_type:
                  "Order Invoice Event with Authorized and Capture State",
                message: "Pro Forma Invoice Created.",
              },
            };
            return response;
          }
          // } else {
          //   const response = {
          //     statusCode: 200,
          //     body: {
          //       msg: "Payment is in captured state, Please review this",
          //     },
          //     event_type: "Order Invoice Event",
          //   };
          //   logger.info(`${response.statusCode}: successful request`);
          //   return response;
          // }
        } else {
          return errorResponse(
            500,
            "OMS Order Detail Not Found, Reason is Order is still in process adding into OMS.",
            logger,
          );
        }
      } else {
        return errorResponse(
          500,
          "error getting details from userDetails :" +
            userDetails +
            " server error",
          logger,
        );
      }
    } else {
      await remove(isOMSChargesAvailableKey);
      const response = {
        statusCode: 200,
        body: {
          //recordCreationResponse,
          transaction_type: txn_type,
          event_type: "OMS Invoice Charges",
          message: "OMS Invoice & Charges are already been processed.",
          _processOMSCharges: processOMSCharges,
          _isOMSChargesAvailable: isOMSChargesAvailable,
        },
      };
      return response;
    }
  } catch (error) {
    await remove(
      "RECORDED_CHARGES_" +
        params.data.value.increment_id +
        "_" +
        params.data.value.order_id,
    );
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, "server error", logger);
  }
}

exports.main = main;
