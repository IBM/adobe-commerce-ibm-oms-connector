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
const { changeOrder } = require('../../services/OMSService');
const { getUserDetails } = require('../../auth/OMSAuthentication');
const { init } = require('../../config/StateStore');
const { changeOrderPayload } = require('../../models/order');

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

  try {
    await init();
    // 'info' is the default level if not set
    logger.info('Calling the main action');

    const userDetails = await getUserDetails(params);
    const prepareChangeOrderPayload = await changeOrderPayload(params,userDetails);
    const changeOrderResponse = await changeOrder(params, userDetails, prepareChangeOrderPayload);

    console.log('changeOrderResponse', JSON.stringify(changeOrderResponse));

    if (changeOrderResponse) {
      let response = {};
      // log the response status code
      logger.info(`${changeOrderResponse}: successful request`);
      if(changeOrderResponse.id) {
        response = {
          statusCode: 200,
          body: {
            success: true,
            message: 'Order status is successfully updated in OMS'
          }
        };
      } else {
        if(changeOrderResponse.errors) {
          response = {
            statusCode: 200,
            body: {
              success: false,
              message: changeOrderResponse.errors[0].ErrorDescription
            }
          };
        } else {
          response = {
            statusCode: 200,
            body: {
              success: false,
              message: 'Order status is not updated in OMS'
            }
          };
        }
      }
      return response;
    } else {
      // log the response status code
      return errorResponse(500, 'server error :' + changeOrderResponse, logger);
    }

  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, 'server error', logger);
  }
}

exports.main = main;
