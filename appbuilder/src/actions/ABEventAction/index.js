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
const { AB_EVENTS } = require('../../config/constant');
const {
  errorResponse,
  stringParameters
} = require('../utils');
const OrderHoldAC = require('../OrderHoldAC/index');

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger('ABEventAction Main', {
    level: params.LOG_LEVEL || 'info',
  });

  try {
    // 'info' is the default level if not set
    logger.info('Calling the main action');
    if (params.type == AB_EVENTS.ORDER_HOLD) {
      const response = await OrderHoldAC.main(params);
      return response;
    } else {
      // log parameters, only if params.LOG_LEVEL === 'debug'
      logger.debug(stringParameters(params));
      const content = params.type + ' : EVENT NAME NOT DETECTED';
      const response = {
        statusCode: 200,
        body: content,
      };

      // log the response status code
      logger.info(`${response.statusCode}: successful request`);
      return response;
    }
  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, 'server error for event,' + params.type, logger);
  }
}

exports.main = main;
