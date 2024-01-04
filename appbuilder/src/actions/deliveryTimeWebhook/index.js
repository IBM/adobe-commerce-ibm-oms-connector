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
const { getUserDetails }=require('../../auth/OMSAuthentication');
const { getDeliveryTime}=require('../../services/OMSService');
const { init }=require('../../config/StateStore');
// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

  try {
   
    // 'info' is the default level if not set
    await init();
    logger.info('Calling the  promiseDeliveryDate Webhook action');
    console.log('params for promise delivery date',params);
    //console.log(params.data.Token)
    const userDetails = await getUserDetails(params, true);
    console.log('UserDetails',userDetails);
    const data={
      OrganizationCode: userDetails.orgId,
      DependencyShippingRule:'',
      ShipToAddress: {
        Country: params.ShipToAddress.Country,
        ZipCode: params.ShipToAddress.ZipCode
      },
      PromiseLines: {
        PromiseLine: [
          {
            ItemID: params.ItemID,
            RequiredQty: params.RequiredQty,
            UnitOfMeasure: 'EACH'
          }
        ]
      }
    };
    const result=await getDeliveryTime(params,userDetails,data);
    if (result) {

      // log the response status code
      logger.info(`${result}: successful request`);
      const response = {
        statusCode: 200,
        body: result
      };
      return response;
    } else {
      // log the response status code
      return errorResponse(500, 'server error :' + result, logger);
    }

  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, 'server error', logger);
  }
}

exports.main = main;
