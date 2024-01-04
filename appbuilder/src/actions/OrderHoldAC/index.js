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

const { Core } = require('@adobe/aio-sdk');
const { errorResponse } = require('../utils');
const { STATUS, ADOBE_STATUS, STATUS_COMMENTS } = require('../../config/constant');
const { getOauth, addCommentAC, getOrderStatusAC, orderHoldAC, orderInAdobe} = require('../../services/AdobeCommerceService');
const { getResponse } = require('../../models/response');


// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

  try {
    // 'info' is the default level if not set
    await logger.info('Calling the main action', params);
    const { orderId } = params.data;
    const oauth = await getOauth(params, logger);
    await logger.info('Calling the main action', JSON.stringify(params));

    const orders = await orderInAdobe(oauth, orderId);
    if(orders.length === 0) {
      const response = {
        statusCode: 200,
        body: {
          orderId,
          message: 'Order does not exist in Adobe Commerce'
        }
      };
      return response;
    }

    const adobeStatus = await getOrderStatusAC(oauth, orderId);

    if (adobeStatus === ADOBE_STATUS.PENDING || adobeStatus === ADOBE_STATUS.PROCESSING) {
      const orderHoldStatus = await orderHoldAC(oauth, orderId);

      if (orderHoldStatus === true) {
        const commentResponse = await addCommentAC(oauth, orderId, ADOBE_STATUS.HOLD, STATUS_COMMENTS.ORDER_HOLD);
        return commentResponse;
      }
      return orderHoldStatus;
    } else if (adobeStatus == ADOBE_STATUS.HOLD) {
      const orderResponse = await getResponse('ORDER IS ALREADY IN HOLDED STATUS.',
        STATUS.SUCCESS
      );
      logger.info(`${orderResponse.statusCode}: successful request`);
      return orderResponse;
    } else {
      const orderResponse = await getResponse({status: adobeStatus},
        STATUS.SUCCESS
      );
      return orderResponse;
      // return errorResponse(500, "server error: not able to parse order status", logger);
    }
  } catch (error) {
    console.log('11111', error);
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, 'server error', logger);
  }
}

exports.main = main;
