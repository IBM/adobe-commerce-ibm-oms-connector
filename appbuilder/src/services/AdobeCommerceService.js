const {
  HEADER_CONTENT_TYPE,
  ADOBE_API_PATHS,
  ADOBE_API_ENDPOINT,
  STATUS,
  STATUS_COMMENTS,
} = require("../config/constant");
const { getCommerceOauthClient } = require("../auth/Oauth1a");
const {
  prepareOrderStatusChangeResponse,
  orderShippedResponse,
  invoicePayload,
} = require("../models/order");
const { getResponse } = require("../models/response");

async function getOauth(params, logger) {
  let options = {
    url: params.COMMERCE_BASE_URL,
    consumerKey: params.COMMERCE_CONSUMER_KEY,
    consumerSecret: params.COMMERCE_CONSUMER_SECRET,
    accessToken: params.COMMERCE_ACCESS_TOKEN,
    accessTokenSecret: params.COMMERCE_ACCESS_TOKEN_SECRET,
  };
  const oauth = await getCommerceOauthClient(options, logger);
  return oauth;
}

async function addCommentAC(
  oauth,
  orderNo,
  status,
  comment,
  customerNotify = 0,
  visibleOnFront = 1,
) {
  const commentPayload = JSON.stringify({
    statusHistory: {
      comment,
      is_customer_notified: customerNotify,
      is_visible_on_front: visibleOnFront,
      status,
    },
  });

  const commentsURl =
    ADOBE_API_PATHS.ORDER_API + orderNo + ADOBE_API_ENDPOINT.COMMENTS;
  const commentResponse = await oauth.post(
    commentsURl,
    commentPayload,
    HEADER_CONTENT_TYPE,
  );
  const response = await getResponse(
    await prepareOrderStatusChangeResponse(commentResponse),
    STATUS.SUCCESS,
  );
  return response;
}

async function getOrderStatusAC(oauth, orderNo) {
  const statusURl =
    ADOBE_API_PATHS.ORDER_API + orderNo + ADOBE_API_ENDPOINT.STATUSES;
  const response = await oauth.get(statusURl);
  return response;
}

async function orderUnholdAC(oauth, orderNo) {
  const data = JSON.stringify({});
  const unholdUrl =
    ADOBE_API_PATHS.ORDER_API + orderNo + ADOBE_API_ENDPOINT.ORDER_UNHOLD;
  const response = await oauth.post(unholdUrl, data, HEADER_CONTENT_TYPE);
  return response;
}

async function orderHoldAC(oauth, orderNo) {
  const orderHoldUrl =
    ADOBE_API_PATHS.ORDER_API + orderNo + ADOBE_API_ENDPOINT.ORDER_HOLD;
  const response = await oauth.post(orderHoldUrl, "", HEADER_CONTENT_TYPE);
  return response;
}

async function orderShipped(oauth, orderNo, requestBody) {
  const orderShippedURL =
    ADOBE_API_PATHS.ORDER_SINGLE_API + orderNo + ADOBE_API_ENDPOINT.SHIP;
  const orderShippedResponseData = await oauth.post(
    orderShippedURL,
    requestBody,
    HEADER_CONTENT_TYPE,
  );
  const response = await getResponse(
    await orderShippedResponse(orderShippedResponseData),
    STATUS.SUCCESS,
  );
  return response;
}

async function notifyOrderReadyForPickup(oauth, orderNo) {
  const data = JSON.stringify({
    orderIds: [orderNo],
  });
  const orderPickupURL =
    ADOBE_API_PATHS.ORDER_SINGLE_API +
    ADOBE_API_ENDPOINT.NOTIFY_READY_FOR_PICKUP;
  const response = await oauth.post(orderPickupURL, data, HEADER_CONTENT_TYPE);
  return response;
}

async function syncStockApi(oauth, data) {
  const syncStockUrl =
    ADOBE_API_PATHS.INVENTORY + ADOBE_API_ENDPOINT.SOURCE_ITEMS;
  const response = await oauth.post(syncStockUrl, data, HEADER_CONTENT_TYPE);
  return response;
}

async function getAdobeOrderDetails(oauth, orderNo) {
  const orderURL = ADOBE_API_PATHS.ORDER_API + orderNo;
  const response = await oauth.get(orderURL);
  console.log("response here is", response);
  return response;
}

async function addCommentShipmentAC(oauth, shipmentId) {
  const commentPayload = JSON.stringify({
    entity: {
      is_customer_notified: 0,
      comment: STATUS_COMMENTS.READY_FOR_PICKUP,
      is_visible_on_front: 1,
      parent_id: shipmentId,
    },
  });
  const commentsURl =
    ADOBE_API_PATHS.SHIPMENT_API + shipmentId + ADOBE_API_ENDPOINT.COMMENTS;
  const commentResponse = await oauth.post(
    commentsURl,
    commentPayload,
    HEADER_CONTENT_TYPE,
  );
  const response = await getResponse(
    await prepareOrderStatusChangeResponse(commentResponse),
    STATUS.SUCCESS,
  );
  return response;
}

async function getShipmentId(orderId, oauth) {
  const commentsURl =
    ADOBE_API_PATHS.SHIPMENT_ENDPOINT +
    "?" +
    `searchCriteria[filterGroups][0][filters][0][field]=order_id&searchCriteria[filterGroups][0][filters][0][value]=${orderId}`;
  const commentResponse = await oauth.get(commentsURl);
  //const response = await getResponse(await prepareOrderStatusChangeResponse(commentResponse), STATUS.SUCCESS)
  const response = commentResponse.items[0].entity_id;
  return response;
}

async function checkProductInAdobe(oauth, productName) {
  const commentsURl = ADOBE_API_PATHS.STOCK_ITEMS + `${productName}`;
  try {
    const commentResponse = await oauth.get(commentsURl);
    const response = commentResponse.product_id;
    return response;
  } catch (error) {
    return errorResponse(500, "The product is not present", logger);
  }
}

async function findSkuByProductId(oauth, item_id) {
  const commentsURl =
    ADOBE_API_PATHS.PRODUCT +
    "?" +
    `searchCriteria[filterGroups][0][filters][0][field]=row_id&searchCriteria[filterGroups][0][filters][0][value]=${item_id}`;
  const commentResponse = await oauth.get(commentsURl);
  if (commentResponse.items.length > 0) {
    const response = commentResponse.items[0];
    return response;
  }
}

async function orderInAdobe(oauth, orderNo) {
  const orderURL =
    ADOBE_API_PATHS.ORDER_API +
    `?searchCriteria[filterGroups][0][filters][0][field]=entity_id&searchCriteria[filterGroups][0][filters][0][value]=${orderNo}`;
  const response = await oauth.get(orderURL);
  console.log("orderInAdobe result:" + JSON.stringify(response));
  return response.items;
}

async function cancelOrderAC(oauth, orderNo) {
  const orderURL =
    ADOBE_API_PATHS.ORDER_API + orderNo + ADOBE_API_ENDPOINT.CANCEL;
  const response = await oauth.post(orderURL);
  return response;
}

async function getReturns(oauth, orderNo) {
  const orderURL =
    ADOBE_API_PATHS.RETURNS +
    `?searchCriteria[filterGroups][0][filters][0][field]=order_id&searchCriteria[filterGroups][0][filters][0][value]=${orderNo}`;
  const response = await oauth.get(orderURL);
  return response.items;
}
async function getReturn(oauth, returnId) {
  const orderURL = ADOBE_API_PATHS.RETURNS + "/" + returnId;
  const response = await oauth.get(orderURL);
  return response;
}

async function createACReturnMemo(oauth, memoPayload, invoiceId) {
  const data = JSON.stringify(memoPayload);
  console.log("data here is", data);
  const memoURL = ADOBE_API_ENDPOINT.INVOICE + "/" + invoiceId + "/refund";
  const response = await oauth.post(memoURL, data, HEADER_CONTENT_TYPE);
  console.log("response here", response);
  return response;
}

async function getCarrierDetails(shippingMethod) {
  let filteredArray = AC_Carrier_and_Service.filter(
    (i) => i.AC_shipping_method_code == shippingMethod,
  );
  console.log(filteredArray.OMS_SCAC);
}

async function createInvoice(orderNo, oauth, order_obj) {
  // let list = [];
  // let orderItemIdArray = await getAdobeOrderDetails(oauth, orderNo);
  // let itemList = orderItemIdArray.items;
  // itemList.forEach((e) => {
  //   let obj = {
  //     order_item_id: e.item_id,
  //     qty: qty,
  //   };
  //   list.push(obj);
  // });
  let invoicePayloadTemp = await invoicePayload(order_obj);
  console.log("invoicePayloadTemp", invoicePayloadTemp);
  const orderURL =
    ADOBE_API_PATHS.ORDER_SINGLE_API +
    orderNo +
    "/" +
    ADOBE_API_ENDPOINT.INVOICE;
  const response = await oauth.post(
    orderURL,
    invoicePayloadTemp,
    HEADER_CONTENT_TYPE,
  );
  console.log("response in createInvoice", response);
  return response;
}

async function getTransactions(oauth, txn_id) {
  const orderURL =
    ADOBE_API_PATHS.TRANSACTIONS +
    `?searchCriteria[filterGroups][0][filters][0][field]=txn_id&searchCriteria[filterGroups][0][filters][0][value]=${txn_id}`;
  const response = await oauth.get(orderURL);
  console.log("getTransactions.response", response);
  return response.items[0];
}

async function getSource(oauth, searchKey) {
  let syncStockUrl = ADOBE_API_PATHS.INVENTORY + ADOBE_API_ENDPOINT.SOURCE;
  if (searchKey != undefined) {
    syncStockUrl = `${syncStockUrl}?searchCriteria[filterGroups][0][filters][0][field]=postcode&searchCriteria[filterGroups][0][filters][0][value]=${searchKey}`;
  }
  const response = await oauth.get(syncStockUrl);
  return response;
}

async function getInvoice(oauth, orderNo) {
  let invoiceUrl =
    ADOBE_API_PATHS.INVOICES +
    `?searchCriteria[filterGroups][0][filters][0][field]=order_id&searchCriteria[filterGroups][0][filters][0][value]=${orderNo}`;
  const response = await oauth.get(invoiceUrl);
  console.log("response", response);
  return response;
}

async function getCreditMemos(oauth, orderNo) {
  let invoiceUrl =
    ADOBE_API_PATHS.CREDIT_MEMOS +
    `?searchCriteria[filterGroups][0][filters][0][field]=order_id&searchCriteria[filterGroups][0][filters][0][value]=${orderNo}`;
  const response = await oauth.get(invoiceUrl);
  console.log("response", response);
  return response.items;
}

async function getOrderItemDetails(oauth, orderNo) {
  let itemsUrl =
    ADOBE_API_PATHS.ORDER_API +
    `items?searchCriteria[filterGroups][0][filters][0][field]=order_id&searchCriteria[filterGroups][0][filters][0][value]=${orderNo}`;
  const response = await oauth.get(itemsUrl);
  return response.items;
}

async function addPaymentComment(
  oauth,
  orderNo,
  status,
  comment,
  customerNotify = 0,
  visibleOnFront = 1,
) {
  const commentPayload = JSON.stringify({
    statusHistory: {
      comment,
      is_customer_notified: customerNotify,
      is_visible_on_front: visibleOnFront,
      status,
    },
  });

  const commentsURl =
    ADOBE_API_PATHS.ORDER_API + orderNo + ADOBE_API_ENDPOINT.COMMENTS;
  const commentResponse = await oauth.post(
    commentsURl,
    commentPayload,
    HEADER_CONTENT_TYPE,
  );
  const response = await getResponse(
    await prepareOrderStatusChangeResponse(commentResponse),
    STATUS.SUCCESS,
  );
  return response;
}

export {
  getOauth,
  addCommentAC,
  getOrderStatusAC,
  orderUnholdAC,
  orderHoldAC,
  orderShipped,
  addCommentShipmentAC,
  getShipmentId,
  getAdobeOrderDetails,
  syncStockApi,
  checkProductInAdobe,
  notifyOrderReadyForPickup,
  findSkuByProductId,
  orderInAdobe,
  cancelOrderAC,
  getReturns,
  getCarrierDetails,
  createACReturnMemo,
  getTransactions,
  createInvoice,
  getSource,
  getInvoice,
  getCreditMemos,
  getOrderItemDetails,
  addPaymentComment,
  getReturn,
};
