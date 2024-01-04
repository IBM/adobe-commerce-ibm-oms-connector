export const CONFIG = {
  OMS_TOKEN_NAME: "OMS_TOKEN",
  OMS_ADMIN_TOKEN_NAME: "OMS_ADMIN_TOKEN",
  OMS_ORG: "OMS_ORG",
  OMS_USER_ID: "OMS_USER_ID",
  LOGIN_CERTIFICATE_FILE: "secrets/oms_certificate.p12",
  ADOBE_COMMERCE_TOKEN_NAME: "ADOBE_COMMERCE_TOKEN",
};

export const OMS_API = {
  LOGIN: "invoke/login",
  SERVER: "server",
  ORDER_CREATE: "executeFlow/OMSAABCreateOrder",
  CREATE_ORDER_RETURN: "order",
  SHIPMENT: "shipment",
  CONFIRM_SHIPMENT: "invoke/confirmShipment",
  CANCEL_SHIPMENT_QTY: "release/",
  CHANGE_ORDER: "order",
  PROMISE_DELIVERY_DATE: "invoke/findInventory",
  GET_STOCK_DETAIL: "invoke/getAvailableInventory",
  RESERVE_AVAILABLE_INVENTORY: "invoke/reserveAvailableInventory",
  CANCEL_ORDER: "invoke/cancelOrder",
  CHANGE_ORDER_STATUS: "invoke/changeOrderStatus",
  FIND_RECEIPT: "invoke/findReceipt",
  START_RECEIPT: "invoke/startReceipt",
  RECEIVE_ORDER: "invoke/receiveOrder",
  CLOSE_RECEIPT: "invoke/closeReceipt",
  //CREATE_ORDER_INVOICE: "invoke/createOrderInvoice",
  CREATE_ORDER_INVOICE_API: "order_invoice",
  RECORD_INVOICE_CREATION: "invoke/recordInvoiceCreation",
  RECORD_EXTERNAL_CHARGES: "invoke/recordExternalCharges",
};

export const HEADER_CONTENT_TYPE = { "Content-Type": "application/json" };

export const ADOBE_API_PATHS = {
  ORDER_API: "orders/",
  ORDER_SINGLE_API: "order/",
  INVENTORY: "inventory/",
  SHIPMENT_API: "shipment/",
  SHIPMENT_ENDPOINT: "shipments",
  STOCK_ITEMS: "stockItems/",
  PRODUCT: "products",
  RETURNS: "returns",
  RETURN_MEMO: "creditmemo/refund",
  TRANSACTIONS: "transactions",
  INVOICES: "invoices",
  CREDIT_MEMOS: "creditmemos",
};

export const ADOBE_API_ENDPOINT = {
  COMMENTS: "/comments",
  ORDER_HOLD: "/hold",
  ORDER_UNHOLD: "/unhold",
  STATUSES: "/statuses",
  SHIP: "/ship",
  SOURCE_ITEMS: "source-items",
  NOTIFY_READY_FOR_PICKUP: "notify-orders-are-ready-for-pickup",
  CANCEL: "/cancel",
  SOURCE: "sources",
  INVOICE: "invoice",
};

export const Change_Shipment_Demo_Location = {
  location1: "location1",
  location2: "location2",
};

export const STATUS_COMMENTS = {
  ORDER_HOLD: "Order is on HOLD",
  ORDER_UNHOLD: "Order is back in Pending State",
  ORDER_HOLD:
    "Order is on HOLD because the total cost of the order is more than 500$",
  ORDER_UNHOLD: "Order is back in Pending State",
  ORDER_INCLUDED_IN_SHIPMENT:
    "Order has been included in shipment in OMS System",
  ORDER_RELEASED: "Order has been released in OMS system",
  ORDER_SHIPPPED: "Order has been shipped in OMS System",
  READY_FOR_PICKUP: "Shipment is ready for Backroom Pickup",
  ORDER_CANCELLED: " Order is cancelled ",
  PAYMENT_MISMATCH: "Payment information mismatch",
};

export const HOLD_STATUS = {
  YES: "Y",
  NO: "N",
};

export const STATUS = {
  CREATED: "Created",
  SUCCESS: "SUCCESS",
  FAILD: "FAILED",
};

export const ADOBE_STATUS = {
  PENDING: "pending",
  HOLD: "holded",
  PROCESSING: "processing",
  CANCELLED: "canceled",
};

export const OMS_EVENTS = {
  TEST: "ibm.sterling.oms.test_event.v0",
  ORDER_STATUS_CHANGE: "ibm.sterling.adobe.order_status_change.v0",
  SHIPMENT_REQUEST: "ibm.sterling.adobe.shipment_request.v0",
  SHIPMENT_CHANGE: "ibm.sterling.adobe.shipment_change.v0",
  SHIPMENT_SHIPPED: "ibm.sterling.adobe.shipment_shipped.v0",
  STOCK_CHANGE: "ibm.sterling.adobe.stock_change.v0",
  ORDER_MONITOR: "ibm.sterling.adobe.order_monitor.v0",
  BACK_ORDER: "ibm.sterling.adobe.backorder.v0",
  PAYMENT_EXECUTION: "ibm.sterling.adobe.request_payment.v0",
};

export const AC_EVENTS = {
  SAVE: "com.adobe.commerce.observer.sales_order_save_commit_after",
  RETURN: "com.adobe.commerce.observer.rma_save_commit_after",
  CREDIT_MEMO:
    "com.adobe.commerce.observer.sales_order_creditmemo_save_commit_after",
  INVOICE: "com.adobe.commerce.observer.sales_order_invoice_save_commit_after",
};

export const AB_EVENTS = {
  ORDER_HOLD: "ibm.sterling.appbuilder.order_hold.v0",
};

export const EVENT_PROVIDER_ACTION_TYPE = {
  PROVIDER_AND_EVENT: "PROVIDER_AND_EVENT",
  EVENT: "EVENT",
};

export const RETURN_STATUS = {
  PENDING: "pending",
  AUTHORIZED: "authorized",
  RECEIVED: "received",
  CLOSED: "closed",
  PROCESSED_CLOSED: "processed_closed",
};

export const API_TEMPLATE = {
  CREATE_ORDER_RETURN: "&_templateKey=def_createOrder_01",
  SHIPMENT: "&_templateKey=def_createShipment_01",
  CONFIRM_SHIPMENT: "&_templateKey=def_confirmShipment_01",
  CANCEL_SHIPMENT_QTY: "&_templateKey=def_changeRelease_01",
  CHANGE_ORDER: "&_templateKey=def_changeOrder_01",
  GET_OMS_ORDER_DETAILS: "&_templateKey=def_getOrderList_01",
  PROMISE_DELIVERY_DATE: "&_templateKey=def_findInventory_01",
  GET_STOCK_DETAIL: "&_templateKey=def_getAvailableInv_01",
  RESERVE_AVAILABLE_INVENTORY: "&_templateKey=def_resrvAvailInv_01",
  CANCEL_ORDER: "&_templateKey=def_cancelOrder_01",
  CHANGE_ORDER_STATUS: "&_templateKey=def_changeOrderStatus_01",
  FIND_RECEIPT: "&_templateKey=def_findReceipt_01",
  START_RECEIPT: "&_templateKey=def_startReceipt_01",
  RECEIVE_ORDER: "&_templateKey=def_receiveOrder_01",
  CREATE_ORDER_INVOICE: "&_templateKey=def_createOrdInvoice_01",
  RECORD_INVOICE_CREATION: "&_templateKey=def_recInvoiceCreate_01",
};
