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
  errorResponse
} = require('../utils');
const {
  getOauth,
  syncStockApi,
  findSkuByProductId,
} = require('../../services/AdobeCommerceService');

// main function that will be executed by Adobe I/O Runtime
async function main(params, log) {
 
  let logger = log;
  if(!logger) {
    // create a Logger
    logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });
  }

  try {
    // 'info' is the default level if not set
    logger.info('Calling the StockSync action');

    //const sku=params.data.InventoryItem.ProductClass
    const items = [];
    const oauth = await getOauth(params, logger);
    const item_id = params.data.InventoryItem.ItemID;
    console.log('item_id',item_id)
    console.log('params.data.InventoryItem.ItemID',params.data.InventoryItem.ItemID)
    const tempResp = await findSkuByProductId(oauth, item_id); 
    console.log('tempResp',tempResp)
    if(tempResp !=undefined){
      let sku =tempResp.sku
      const itemDetails =
      params.data.InventoryItem.AvailabilityChanges.AvailabilityChange;
    itemDetails.forEach((e) => {
      if (!e.DistributionRuleId && e.Node != '') {
        let status = e.OnhandAvailableQuantity > 0 ? 1 : 0;
        let obj = {
          sku: sku,
          source_code: e.Node,
          quantity: e.OnhandAvailableQuantity,
          status: status,
        };
        items.push(obj);
      }
    });
    }
    else{
      const response = {
        statusCode: 200,
        body: {
          message: 'ItemId does not exist in Adobe Commerce'
        }
      };
      return response;
    }
  

    // const source_code=params.data.InventoryItem.AvailabilityChanges.AvailabilityChange.Node

    // const quantity=params.data.InventoryItem.AvailabilityChanges.AvailabilityChange.OnhandAvailableQuantity
    // const status= quantity >0 ? 1 : 0

    if (items.length > 0) {
      let data = {
        sourceItems: items,
      };
      console.log('data', data);

      const content = await syncStockApi(oauth, JSON.stringify(data));
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
    return errorResponse(500, 'server error', logger);
  }
}

exports.main = main;
