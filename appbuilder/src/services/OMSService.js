//#region  Depedency
const { login } = require("../auth/OMSAuthentication");
const { log } = require("../helpers/LoggerHelper");
const fs = require("fs");
const fetch = require("node-fetch");
const https = require("https");
const { OMS_API, CONFIG, API_TEMPLATE } = require("../config/constant");

//#endregion
let localToken;
let attachTemplate = true;
// async function apiCall(url, method, body, params, userDetails, queryParams) {
//     // retrieve P12 certificate
//     const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
//     //setToken in local veriable
//     localToken = userDetails.token
//     let query = '';

//     if(queryParams && queryParams.length > 0){
//         console.log('insideeeeeee')

//         for(let i=0; i<queryParams.length; i++){
//             if(i === 0) {
//                 query = query + `?${queryParams[i].key}=${queryParams[i].value}`
//             } else {
//                 query = query + `&${queryParams[i].key}=${queryParams[i].value}`
//             }
//         }
//     }
//      console.log('query here is', query)

//     //Preparing the Query
//     query = query + queryParams && queryParams.length > 0 ? '&' :  '?'
//     query = query + '_loginid=' + params.OMS_USERNAME + '&_token='
//     let reqObj = {
//         method,
//         headers: {
//             'content-type': 'application/json',
//             'X-XAPI-Tag': 'Order'
//         },
//         agent: new https.Agent({
//             pfx: cert,
//             passphrase: params.OMS_CLIENT_CERT_PASS
//         }),
//     }
//     if(method === 'POST') {
//         reqObj['body'] = JSON.stringify(body)
//     }

//     console.log('query', query)
//     console.log('url', url)
//     console.log('combine value', url+query)

//     const request = await fetchRetry(url+query, reqObj, params, 400, 4, true, localToken)
//     const response = request.json()
//     return response;
// }

//#region Public Method
async function createOrder(params, userDetails, orderData) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;

    //Preparing the Query
    let query = "?_loginid=" + params.OMS_USERNAME + "&_token=";

    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.ORDER_CREATE + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-XAPI-Tag": "Order",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(orderData),
      },
      params,
      400,
      4,
      true,
      localToken,
    );

    //Response capture and return the result
    const orderCreateResponse = await request.json();
    await log(
      "createOrder API Call Result: " + JSON.stringify(orderCreateResponse),
      "createOrder",
      "info",
      "debug",
    );
    return orderCreateResponse;
  } catch (ex) {
    console.log("createOrder", ex);
    return null;
  }
}

async function createOrderAPI(params, userDetails, orderData) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;

    //Preparing the Query
    let query = "?_loginid=" + params.OMS_USERNAME + "&_token=";

    if (attachTemplate) {
      query =
        "?_loginid=" +
        params.OMS_USERNAME +
        API_TEMPLATE.CREATE_ORDER_RETURN +
        "&_token=";
    }

    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.CREATE_ORDER_RETURN + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-XAPI-Tag": "Order",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(orderData),
      },
      params,
      400,
      4,
      true,
      localToken,
    );

    //Response capture and return the result
    const orderCreateResponse = await request.json();
    await log(
      "createOrder API Call Result: " + JSON.stringify(orderCreateResponse),
      "createOrder",
      "info",
      "debug",
    );
    return orderCreateResponse;
  } catch (ex) {
    console.log("createOrder", ex);
    return null;
  }
}
//#endregion

//#region Retry if current calls faild and regenerate token
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchRetry(
  url,
  option,
  params,
  retryStatusCode,
  counter,
  tokenUpdateRequire = false,
  token = "",
  isAdmin,
) {
  return new Promise(async (resolve, reject) => {
    let customizeURL = url + token;
    await log(
      "customizeURL: " + JSON.stringify(customizeURL),
      "fetchRetry",
      "info",
      "debug",
    );
    let found = false;
    let attempt = 0;
    while (found !== true && attempt < counter) {
      try {
        await sleep(100);//It was 1000, but due to it is delaying the API call hence reduce from 1000 to 100 
        attempt = attempt + 1;
        const response = await fetch(customizeURL, option);
        if (response.status != retryStatusCode || attempt == counter) {
          found = true;
          resolve(response);
        } else {
          await generateToken(params, response, isAdmin);
          if (tokenUpdateRequire) {
            customizeURL = url + localToken;
            await log(
              "customizeURL inside: " + JSON.stringify(customizeURL),
              "fetchRetry",
              "info",
              "debug",
            );
          }
        }
      } catch (error) {
        reject(error);
      }
    }
  });
}

/* Generate the Token and store into local veriable to use */
async function generateToken(params, response, isAdmin) {
  const loginResponse = await login(params, true, isAdmin ? true : false);
  if (loginResponse != null) {
    localToken = loginResponse.token;
    return true;
  } else {
    return false;
  }
}

async function changeShipment(params, userDetails, shipPaylod) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;

    //Preparing the Query
    let query = "?_loginid=" + params.OMS_USERNAME + "&_token=";

    if (attachTemplate) {
      query =
        "?_loginid=" + params.OMS_USERNAME + API_TEMPLATE.SHIPMENT + "&_token=";
    }

    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.SHIPMENT + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(shipPaylod),
      },
      params,
      400,
      4,
      true,
      localToken,
    );

    //Response capture and return the result
    const response = await request.json();
    await log(
      "changeOrder API Call Result: " + JSON.stringify(response),
      "shipment",
      "info",
      "debug",
    );
    return response;
  } catch (ex) {
    console.log("changeOrder", ex);
    return null;
  }
}

async function confirmShipment(params, userDetails, shipPaylod) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;

    //Preparing the Query
    let query = "?_loginid=" + params.OMS_USERNAME + "&_token=";

    if (attachTemplate) {
      query =
        "?_loginid=" +
        params.OMS_USERNAME +
        API_TEMPLATE.CONFIRM_SHIPMENT +
        "&_token=";
    }

    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.CONFIRM_SHIPMENT + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(shipPaylod),
      },
      params,
      400,
      4,
      true,
      localToken,
    );

    //Response capture and return the result
    const response = await request.json();
    await log(
      "confirm shipment API Call Result: " + JSON.stringify(response),
      "confirm shipment",
      "info",
      "debug",
    );
    return response;
  } catch (ex) {
    console.log("changeOrder", ex);
    return null;
  }
}

async function cancelRemainingQty(params, userDetails, shipPaylod) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;

    //Preparing the Query
    let query = "?_loginid=" + params.OMS_USERNAME + "&_token=";

    if (attachTemplate) {
      query =
        "?_loginid=" +
        params.OMS_USERNAME +
        API_TEMPLATE.CANCEL_SHIPMENT_QTY +
        "&_token=";
    }

    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL +
        OMS_API.CANCEL_SHIPMENT_QTY +
        params.data.orderReleaseKey +
        query,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(shipPaylod),
      },
      params,
      400,
      4,
      true,
      localToken,
    );

    //Response capture and return the result
    const response = await request.json();
    await log(
      "confirm shipment API Call Result: " + JSON.stringify(response),
      "confirm shipment",
      "info",
      "debug",
    );
    return response;
  } catch (ex) {
    console.log("changeOrder", ex);
    return null;
  }
}

async function changeOrder(params, userDetails, orderData) {
  await log(JSON.stringify(params), "createOrder", "info", "debug");

  //TODO: REST API for create order NEED TO WORK ON Integration
  //Commenting below part need to modify for SPRINT 3

  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;

    //Preparing the Query
    let query = "?_loginid=" + params.OMS_USERNAME + "&_token=";

    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.CHANGE_ORDER + query,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "X-XAPI-Tag": "Order",
          "servlet.put.enabled": "yes",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(orderData),
      },
      params,
      400,
      4,
      true,
      localToken,
    );

    //Response capture and return the result
    const orderChangeResponse = await request.json();
    await log(
      "changeOrder API Call Result: " + JSON.stringify(orderChangeResponse),
      "createOrder",
      "info",
      "debug",
    );
    return orderChangeResponse;
  } catch (ex) {
    return null;
  }
}

async function getStockDetails(params, userDetails, stockPayload) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;
    await log(
      "stock details API Call Result: " + JSON.stringify(stockPayload),
      "stockPayload",
      "info",
      "debug",
    );

    //Preparing the Query
    let query = "?_loginid=" + params.OMS_ADMIN_USERNAME + "&_token=";
    // call login endpoint passing client certificate

    if (attachTemplate) {
      query =
        "?_loginid=" +
        params.OMS_ADMIN_USERNAME +
        API_TEMPLATE.GET_STOCK_DETAIL +
        "&_token=";
    }

    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.GET_STOCK_DETAIL + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(stockPayload),
      },
      params,
      400,
      4,
      true,
      localToken,
      true,
    );

    //Response capture and return the result
    const response = await request.json();
    await log(
      "stock details API Call Result: " + JSON.stringify(response),
      "stockDetails",
      "info",
      "debug",
    );
    return response;
  } catch (ex) {
    console.log("stock details", ex);
    return null;
  }
}

async function getDeliveryTime(params, userDetails, orderData) {
  await log(JSON.stringify(params), "createOrder", "info", "debug");

  //TODO: REST API for create order NEED TO WORK ON Integration
  //Commenting below part need to modify for SPRINT 3

  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;
    let query = "?_loginid=" + params.OMS_ADMIN_USERNAME + "&_token=";

    if (attachTemplate) {
      query =
        "?_loginid=" +
        params.OMS_ADMIN_USERNAME +
        API_TEMPLATE.PROMISE_DELIVERY_DATE +
        "&_token=";
    }

    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.PROMISE_DELIVERY_DATE + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-XAPI-Tag": "Order",
          "servlet.put.enabled": "yes",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(orderData),
      },
      params,
      400,
      4,
      true,
      localToken,
      true,
    );

    console.log("request here is", request);

    //Response capture and return the result
    const getDeliveryTime = await request.json();
    await log(
      "getDeliveryTime API Call Result: " + JSON.stringify(getDeliveryTime),
      "createOrder",
      "info",
      "debug",
    );
    return getDeliveryTime;
  } catch (ex) {
    console.log("getDeliveryTime", ex);
    return null;
  }
}

async function reserveAvailableInventory(params, userDetails, reserveData) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;
    let query = "?_loginid=" + params.OMS_ADMIN_USERNAME + "&_token=";

    if (attachTemplate) {
      query =
        "?_loginid=" +
        params.OMS_ADMIN_USERNAME +
        API_TEMPLATE.RESERVE_AVAILABLE_INVENTORY +
        "&_token=";
    }

    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.RESERVE_AVAILABLE_INVENTORY + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(reserveData),
      },
      params,
      400,
      4,
      true,
      localToken,
      true,
    );

    const reserveAvailableInventory = await request.json();
    const reservationId =
      reserveAvailableInventory?.PromiseLines?.PromiseLine[0]?.Reservations
        ?.Reservation?.[0]?.ReservationID;

    await log(
      "reserveAvailableInventory API Call Result: " +
        JSON.stringify(reserveAvailableInventory),
      "reserveAvailableInventory",
      "info",
      "debug",
    );
    return { reservationId, reserveAvailableInventory };
  } catch (ex) {
    console.log("error here", ex);
    return null;
  }
}

async function cancelOrderOMS(params, userDetails, data) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable

    localToken = userDetails.token;
    let query = "?_loginid=" + params.OMS_ADMIN_USERNAME + "&_token=";

    if (attachTemplate) {
      query =
        "?_loginid=" +
        params.OMS_ADMIN_USERNAME +
        API_TEMPLATE.CANCEL_ORDER +
        "&_token=";
    }

    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.CANCEL_ORDER + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(data),
      },
      params,
      400,
      4,
      true,
      localToken,
      true,
    );

    const response = await request.json();
    //await log("reserveAvailableInventory API Call Result: " + JSON.stringify(reserveAvailableInventory), "reserveAvailableInventory", "info", "debug")
    return response;
  } catch (ex) {
    console.log("error here", ex);
    return null;
  }
}

async function getOMSOrderDetails(params, userDetails, orderId) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;

    //Preparing the Query
    let query =
      "?OrderNo=" +
      orderId +
      "&DocumentType=0001" +
      "&_templateKey=def_getOrderList_01" +
      "&EnterpriseCode" +
      userDetails.orgId +
      "&_loginid=" +
      params.OMS_USERNAME +
      "&_token=";

    console.log(params.OMS_API_BASE_URL + OMS_API.CHANGE_ORDER + query);

    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.CHANGE_ORDER + query,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
      },
      params,
      400,
      4,
      true,
      localToken,
    );

    //Response capture and return the result
    const getOrderResp = await request.json();
    return getOrderResp;
  } catch (ex) {
    console.log("getOrder", ex);
    return null;
  }
}

async function getOMSReturnOrderDetails(
  params,
  userDetails,
  orderId,
  docType = "0003",
) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;

    //Preparing the Query
    let query =
      "?OrderNo=" +
      orderId +
      "&DocumentType=" +
      docType +
      "&_templateKey=def_getOrderList_01" +
      "&EnterpriseCode" +
      userDetails.orgId +
      "&_loginid=" +
      params.OMS_USERNAME +
      "&_token=";

    console.log(params.OMS_API_BASE_URL + OMS_API.CHANGE_ORDER + query);

    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.CHANGE_ORDER + query,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
      },
      params,
      400,
      4,
      true,
      localToken,
    );

    //Response capture and return the result
    const getOrderResp = await request.json();
    console.log("getOrderResp", getOrderResp);
    return getOrderResp;
  } catch (ex) {
    console.log("getOrder", ex);
    return null;
  }
}

async function changeOrderStatus(params, userDetails, orderData) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;

    //Preparing the Query
    let query = "?_loginid=" + params.OMS_USERNAME + "&_token=";

    if (attachTemplate) {
      query =
        "?_loginid=" +
        params.OMS_USERNAME +
        API_TEMPLATE.CHANGE_ORDER_STATUS +
        "&_token=";
    }

    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.CHANGE_ORDER_STATUS + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-XAPI-Tag": "Order",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(orderData),
      },
      params,
      400,
      4,
      true,
      localToken,
    );

    //Response capture and return the result
    const changeOrderResp = await request.json();
    await log(
      "change Order API Call Result: " + JSON.stringify(changeOrderResp),
      "change Order",
      "info",
      "debug",
    );
    return changeOrderResp;
  } catch (ex) {
    console.log("Change Order", ex);
    return null;
  }
}

async function findReceipt(params, userDetails, data) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;

    //Preparing the Query
    let query = "?_loginid=" + params.OMS_USERNAME + "&_token=";

    if (attachTemplate) {
      query =
        "?_loginid=" +
        params.OMS_USERNAME +
        API_TEMPLATE.FIND_RECEIPT +
        "&_token=";
    }

    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.FIND_RECEIPT + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(data),
      },
      params,
      400,
      4,
      true,
      localToken,
    );

    //Response capture and return the result
    const changeOrderResp = await request.json();
    await log(
      "find receipt API Call Result: " + JSON.stringify(changeOrderResp),
      "find receipt",
      "info",
      "debug",
    );
    return changeOrderResp;
  } catch (ex) {
    console.log("find receipt error", ex);
    return null;
  }
}

async function startReceipt(params, userDetails, data) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;

    //Preparing the Query
    let query = "?_loginid=" + params.OMS_USERNAME + "&_token=";

    if (attachTemplate) {
      query =
        "?_loginid=" +
        params.OMS_USERNAME +
        API_TEMPLATE.START_RECEIPT +
        "&_token=";
    }

    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.START_RECEIPT + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(data),
      },
      params,
      400,
      4,
      true,
      localToken,
    );

    //Response capture and return the result
    const changeOrderResp = await request.json();
    await log(
      "start receipt API Call Result: " + JSON.stringify(changeOrderResp),
      "start receipt",
      "info",
      "debug",
    );
    return changeOrderResp;
  } catch (ex) {
    console.log("start receipt error", ex);
    return null;
  }
}

async function receiveOrder(params, userDetails, data) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;

    //Preparing the Query
    let query = "?_loginid=" + params.OMS_USERNAME + "&_token=";

    if (attachTemplate) {
      query =
        "?_loginid=" +
        params.OMS_USERNAME +
        API_TEMPLATE.RECEIVE_ORDER +
        "&_token=";
    }

    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.RECEIVE_ORDER + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(data),
      },
      params,
      400,
      4,
      true,
      localToken,
    );

    //Response capture and return the result
    const changeOrderResp = await request.json();
    await log(
      "receive order API Call Result: " + JSON.stringify(changeOrderResp),
      "receive Order",
      "info",
      "debug",
    );
    return changeOrderResp;
  } catch (ex) {
    console.log("receive Order", ex);
    return null;
  }
}

async function closeReceipt(params, userDetails, data) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;

    //Preparing the Query
    let query = "?_loginid=" + params.OMS_USERNAME + "&_token=";

    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.CLOSE_RECEIPT + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(data),
      },
      params,
      400,
      4,
      true,
      localToken,
    );

    //Response capture and return the result
    const changeOrderResp = await request.json();
    await log(
      "close receipt API Call Result: " + JSON.stringify(changeOrderResp),
      "close receipt",
      "info",
      "debug",
    );
    return changeOrderResp;
  } catch (ex) {
    console.log("Change Order", ex);
    return null;
  }
}

async function createOrderInvoice(params, userDetails, data) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;

    //Preparing the Query
    let query = "?_loginid=" + params.OMS_USERNAME + "&_token=";

    if (attachTemplate) {
      query =
        "?_loginid=" +
        params.OMS_USERNAME +
        API_TEMPLATE.CREATE_ORDER_INVOICE +
        "&_token=";
    }

    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.CREATE_ORDER_INVOICE_API + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(data),
      },
      params,
      400,
      4,
      true,
      localToken,
    );

    //Response capture and return the result
    const changeOrderResp = await request.json();
    await log(
      "create order invoice API Call Result: " +
        JSON.stringify(changeOrderResp),
      "change Order",
      "info",
      "debug",
    );
    return changeOrderResp;
  } catch (ex) {
    console.log("Change Order", ex);
    return null;
  }
}

async function recordInvoiceCreation(params, userDetails, data) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;
    //Preparing the Query
    let query = "?_loginid=" + params.OMS_ADMIN_USERNAME + "&_token=";

    if (attachTemplate) {
      query =
        "?_loginid=" +
        params.OMS_ADMIN_USERNAME +
        API_TEMPLATE.RECORD_INVOICE_CREATION +
        "&_token=";
    }

    console.log("requestUrl", JSON.stringify(data));

    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.RECORD_INVOICE_CREATION + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(data),
      },
      params,
      400,
      4,
      true,
      localToken,
    );
    //Response capture and return the result
    const changeOrderResp = await request.json();
    await log(
      "recordInvoiceCreation API Call Result: " +
        JSON.stringify(changeOrderResp),
      "change Order",
      "info",
      "debug",
    );
    return changeOrderResp;
  } catch (ex) {
    console.log("Change Order", ex);
    return null;
  }
}

async function recordExternalCharges(params, userDetails, data) {
  try {
    // retrieve P12 certificate
    const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
    //setToken in local veriable
    localToken = userDetails.token;
    //Preparing the Query
    let query = "?_loginid=" + params.OMS_ADMIN_USERNAME + "&_token=";
    // call login endpoint passing client certificate
    const request = await fetchRetry(
      params.OMS_API_BASE_URL + OMS_API.RECORD_EXTERNAL_CHARGES + query,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify(data),
      },
      params,
      400,
      4,
      true,
      localToken,
    );
    //Response capture and return the result
    const changeOrderResp = await request.json();
    await log(
      "recordExternalCharges Call Result: " + JSON.stringify(changeOrderResp),
      "change Order",
      "info",
      "debug",
    );
    return changeOrderResp;
  } catch (ex) {
    console.log("recordExternalCharges", ex);
    return null;
  }
}

//#endregion

//Export method to class
export {
  createOrder,
  changeShipment,
  confirmShipment,
  changeOrder,
  getDeliveryTime,
  getStockDetails,
  reserveAvailableInventory,
  cancelRemainingQty,
  cancelOrderOMS,
  getOMSOrderDetails,
  changeOrderStatus,
  getOMSReturnOrderDetails,
  findReceipt,
  startReceipt,
  receiveOrder,
  closeReceipt,
  createOrderInvoice,
  recordInvoiceCreation,
  recordExternalCharges,
  createOrderAPI,
};
