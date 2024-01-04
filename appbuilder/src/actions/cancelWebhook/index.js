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


const fetch = require('node-fetch');
const { Core } = require('@adobe/aio-sdk');
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils');
const {getOauth,cancelOrderAC,addCommentAC} =require('../../services/AdobeCommerceService');
const { getUserDetails } = require('../../auth/OMSAuthentication');
const { cancelOrderOMS } = require('../../services/OMSService');
const { cancelOrderPayload } = require('../../models/order');
const { ADOBE_STATUS,STATUS_COMMENTS} =require('../../config/constant');
// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

  try {
    // 'info' is the default level if not set
    logger.info('Calling the main action');

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params));
    const oauth =await getOauth(params,logger);
    const userDetails = await getUserDetails(params, true);
    const data = await cancelOrderPayload(params.data, userDetails);
    console.log('data in payload',data);
    const resp = await cancelOrderOMS(params,userDetails,data);
    console.log('resp',resp);
    //const resp=await cancelOrderOMS(params)
    if(resp.OrderNo){
    //const result= await cancelOrderAC(oauth,resp.OrderNo)
      const commentResponse = await addCommentAC(oauth, resp.OrderNo, ADOBE_STATUS.CANCELLED, STATUS_COMMENTS.ORDER_CANCELLED);
      if(commentResponse){
        const response ={
          statusCode: 200,
          body: {
            CancelAllowed:true,
            message:'Order has been cancelled in Adobe Commerce'
          }
        };
        return response;
      }
  
    }

    else{
      const response = {
        statusCode: 200,
        body: {
          CancelAllowed:false,
          message: 'Order cannot be cancelled in OMS '
        }
      };
      return response;
    }

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