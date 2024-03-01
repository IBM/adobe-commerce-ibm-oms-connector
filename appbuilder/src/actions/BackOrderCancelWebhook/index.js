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
      memoACPayload,
      generateInvoicePayload,
      changeOrderStatusPayload,
    } = require("../../models/order");
    const {
      changeOrder,
      getOMSOrderDetails,
      createOrderInvoice,
      changeOrderStatus,
      getOMSReturnOrderDetails,
    } = require("../../services/OMSService");
    const {
      createACReturnMemo,
      getOauth,
      orderInAdobe,
      getReturns,
      getInvoice,
      getCreditMemos,
    } = require("../../services/AdobeCommerceService");

    // main function that will be executed by Adobe I/O Runtime
    async function main(params) {
      // create a Logger
      const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });

      try {
        const userDetails = await getUserDetails(params);
        const oauth = await getOauth(params, logger);

        const transaction = await getTransactions(
          oauth,
          updatedParams.payment.transaction_id,
        );
        console.log("transaction", transaction);
        updatedParams["paymentType"] = transaction.txn_type;

        if (transaction.txn_type === "capture") {
          const adobeOrder = await orderInAdobe(
            oauth,
            params.data.value.order_id,
          );
          const invoice = await getInvoice(oauth, params.data.value.order_id);

          const memoPayload = await memoACPayload(
            adobeOrder[0].items,
            "CREDITMEMO_FOR_BACKORDER_CANCEL",
          );
          const memoResp = await createACReturnMemo(
            oauth,
            memoPayload,
            invoice.entity_id,
          );

          const response = {
            statusCode: 200,
            body: memoResp,
          };

          // log the response status code
          logger.info(`${response.statusCode}: successful request`);
          return response;
        } else {
          //TODO: CANCEL ORDER Cancel Order Item or full cancel
        }
      } catch (error) {
        console.log("error", error);
        // log any server errors
        logger.error(error);
        // return with 500
        return errorResponse(500, "server error", logger);
      }
    }

    exports.main = main;

    const response = {
      statusCode: 200,
      body: params,
      event_type: "Back Order Cancel Event Webhook",
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
