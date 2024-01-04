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
const { getResponse } = require('../../models/response');
const { HOLD_STATUS, STATUS, ADOBE_STATUS, STATUS_COMMENTS } = require('../../config/constant');
const { getOauth, addCommentAC, getOrderStatusAC, orderUnholdAC, orderInAdobe } = require('../../services/AdobeCommerceService');


// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

  try {
    // 'info' is the default level if not set
    logger.info('Calling the main action');

    const { HoldFlag, Status, OrderNo } = params.data.Order;

    if(HoldFlag === HOLD_STATUS.NO && Status === STATUS.CREATED) {
      const oauth = await getOauth(params, logger);
      const orders = await orderInAdobe(oauth, OrderNo);
      console.log('orders here', orders.length);

      if(orders.length == 0) {
        console.log('insideeeee');
        const response = {
          statusCode: 200,
          body: {
            orderId: OrderNo,
            message: 'Order does not exist in Adobe Commerce'
          }
        };
        console.log('response hgere', response);
        return response;
      }

      const adobeStatus = await getOrderStatusAC(oauth, OrderNo);

      if (adobeStatus == ADOBE_STATUS.HOLD) {

        const commentResponse = await addCommentAC(oauth, OrderNo, ADOBE_STATUS.PENDING, STATUS_COMMENTS.ORDER_UNHOLD);
  
        //For caliing unhold api
        await orderUnholdAC(oauth, OrderNo);
        return commentResponse;

      } else {
        let data = { HoldFlag, Status, OrderNo, adobeStatus };
        const response = await getResponse(data, STATUS.SUCCESS);
        return response;
      }
    } else {
      let data = {
        HoldFlag, Status, OrderNo
      };
      const response = await getResponse(data, STATUS.SUCCESS);
      return response;
    }
    
    
  } catch (error) {
    logger.error(error);
    // return with 500
    return errorResponse(500, 'server error', logger);
  }
}

exports.main = main;