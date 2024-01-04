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
const {
  errorResponse,
  stringParameters
} = require('../utils');
const { callWmsApi } = require('../../services/dcApiCall');
const { Change_Shipment_Demo_Location } = require('../../config/constant');
const { init } = require('../../config/StateStore');


async function main(params, log) {

  let logger = log;
  if(!logger) {
    // create a Logger
    logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });
  }

  try {
    // 'info' is the default level if not set
    logger.info('Calling the shipmentRequest action');
    logger.info('shipment param', params.data);
    await init();
    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params));
    // const oauth = await getOauth(params, logger)
    // const orderId=params.data.OrderRelease.Order.OrderNo
    // console.log('orderId',orderId)
    // const commentResponse = await addCommentAC(oauth, orderId, ADOBE_STATUS.PENDING, STATUS_COMMENTS.ORDER_RELEASED);
    // console.log(commentResponse)

    //TODO: Remove this code as it is shidted to Shipment Change OMS
    // const userDetails = await getUserDetails(params)
    // const result=await changeShipment(params,userDetails);

    // check for missing request input parameters and headers
    // const requiredParams = [/* add required params */]
    // // const requiredHeaders = ['Authorization']
    // const errorMessage = checkMissingRequestInputs(params, requiredParams, [])
    // if (errorMessage) {
    //   // return and log client errors
    //   return errorResponse(400, errorMessage, logger)OrderNo
    // }
    const location = Change_Shipment_Demo_Location;
    const { location1, location2 } = location;

    switch (params.locationId) {
    case params.location == location1:
      const shipmentStatus = await callWmsApi(location1); //TODO: WMS actual implimentation goes into this method
      if (shipmentStatus.status == 200) {
        //TODO: Write code here for Another action to be taken after WMS response received
      }
      break;
    case params.location == location2:
      //to do
      break;
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
    return errorResponse(500, 'server error', logger);
  }
}

exports.main = main;
