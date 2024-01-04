import { line } from "stylis";

const moment = require("moment");
const { selectType } = require("../services/Functions");
const { getCarrierDetails } = require("../models/carrierDetails");
const {
  getOrderItemDetails,
  getOauth,
} = require("../services/AdobeCommerceService");

async function prepareOrderStatusChangeResponse(data) {
  return {
    commentSaved: data,
  };
}

async function preparePaymentObj(type, payment, authExpirationSpan) {
  let paymentObj = {};
  if (type.length === 0) {
    paymentObj = {
      PaymentMethod: [
        {
          PaymentType: "OTHER",
          PaymentReference1: payment.id,
          PaymentDetailsList: {
            PaymentDetails: [
              {
                ChargeType: "CHARGE",
                ProcessedAmount: payment.amount_ordered,
                RequestAmount: payment.amount_ordered,
              },
            ],
          },
        },
      ],
    };
  } else if (type === "capture") {
    paymentObj = {
      PaymentMethod: [
        {
          CreditCardNo: payment.cc_last_4,
          UnlimitedCharges: "N",
          CreditCardExpDate: `${payment.cc_exp_month}/${payment.cc_exp_year}`,
          PaymentType: "CREDIT_CARD",
          PaymentDetailsList: {
            PaymentDetails: [
              {
                ChargeType: "CHARGE",
                ProcessedAmount: payment.amount_authorized,
                RequestAmount: payment.amount_authorized,
              },
            ],
          },
        },
      ],
    };
  } else if (type === "authorization") {
    let authorizationDate = moment().utc().add(authExpirationSpan, "days");

    paymentObj = {
      PaymentMethod: [
        {
          CreditCardNo: payment.cc_last_4,
          UnlimitedCharges: "N",
          CreditCardExpDate: `${payment.cc_exp_month}/${payment.cc_exp_year}`,
          PaymentType: "CREDIT_CARD",
          PaymentDetailsList: {
            PaymentDetails: [
              {
                AuthorizationExpirationDate:
                  authorizationDate.format("YYYY-MM-DD"),
                AuthorizationID: payment.additional_information.riskDataId,
                ChargeType: "AUTHORIZATION",
                ProcessedAmount: payment.amount_authorized,
                RequestAmount: payment.amount_authorized,
              },
            ],
          },
        },
      ],
    };
  }
  return paymentObj;
}

async function createOrderPayload(
  params,
  userDetails,
  earliestScheduleDate,
  authExpirationSpan,
  holdAmount,
) {
  try {
    let momentOne = moment();
    let time = momentOne.utc().add(earliestScheduleDate, "minutes");

    const {
      order_currency_code,
      addresses,
      shipping_incl_tax,
      base_grand_total,
      payment,
    } = params;
    const OrderLine = [];

    let items = params.items;
    const billingAddress = addresses.find(
      ({ address_type }) => address_type === "billing",
    );
    const shippingAddress = addresses.find(
      ({ address_type }) => address_type === "shipping",
    );

    let paymentObj = await preparePaymentObj(
      params.paymentType,
      payment,
      authExpirationSpan,
    );

    console.log("paymentObj", paymentObj);
    let productType = "NA";
    let index = 0;
    let PrimeLineNoIndex = 1;
    let bundleParentDetail = [];

    items.map((item) => {
      let orderLinePayload = {
        PrimeLineNo: PrimeLineNoIndex,
        SubLineNo: 1,
        OrderedQty: item.qty_ordered,
        EarliestScheduleDate: time.format("YYYY-MM-DD[T]HH:mm:ss"),
        Item: {
          ItemID: item.product_id,
          CostCurrency: order_currency_code,
          UnitOfMeasure: "EACH", //Need to check
        },
        LinePriceInfo: {
          // UnitPrice: item.price - item.discount_amount / item.qty_ordered,
          UnitPrice: item.price,
          IsPriceLocked: item.has_children ? "N" : "Y",
        },
      };

      if (item.product_type == "bundle") {
        bundleParentDetail.push({ id: item.id, primeLine: PrimeLineNoIndex });
      }
      console.log("bundleParentDetail ", JSON.stringify(bundleParentDetail));

      // if (productType == "bundle" && item.product_type == "simple") {
      let selectedItem = bundleParentDetail.filter(
        (i) => i.id == item.parent_item_id,
      );
      console.log("selectedItem bundle", JSON.stringify(selectedItem));
      if (selectedItem.length > 0) {
        orderLinePayload["BundleParentLine"] = {
          OrderLineKey: "",
          PrimeLineNo: selectedItem[0].primeLine,
          SubLineNo: 1,
          TransactionalLineId: "",
        };
      }
      //}
      //  else {
      //   orderLinePayload["PrimeLineNo"] = 1;
      //   orderLinePayload["SubLineNo"] = 1;
      // }

      if (params.reservationId) {
        (orderLinePayload["OrderLineReservations"] = {
          OrderLineReservation: [
            {
              ItemID: item.product_id,
              Quantity: item.qty_ordered,
              Node: params.nodeId,
              ReservationID: params.reservationId,
              UnitOfMeasure: "EACH",
            },
          ],
        }),
          (orderLinePayload["ShipNode"] = params.nodeId),
          (orderLinePayload["DeliveryMethod"] = "PICK");
      }

      OrderLine.push(orderLinePayload);
      PrimeLineNoIndex++;
    });
    console.log("OrderLine: ", JSON.stringify(OrderLine));

    let payload = {
      DocumentType: "0001",
      EnterpriseCode: userDetails.orgId,
      DraftOrderFlag: "N",
      OrderNo: items[0].order_id,
      PriceInfo: {
        Currency: order_currency_code,
      },
      OrderLines: {
        OrderLine: OrderLine,
      },
      HeaderCharges: {
        HeaderCharge: [
          {
            ChargeAmount: shipping_incl_tax,
            ChargeCategory: "Shipping",
          },
          {
            ChargeAmount: Math.abs(params.discount_amount),
            ChargeCategory: "Discount",
          },
        ],
      },
      PaymentMethods: paymentObj,
      PersonInfoBillTo: {
        AddressLine1: billingAddress.street,
        City: billingAddress.city,
        State: billingAddress.region,
        Country: billingAddress.country_id,
        ZipCode: billingAddress.postcode,
        DayPhoneNo: billingAddress.telephone,
        FirstName: billingAddress.firstname,
        LastName: billingAddress.lastname,
      },
      PersonInfoShipTo: {
        AddressLine1: shippingAddress.street,
        City: shippingAddress.city,
        State: shippingAddress.region,
        Country: shippingAddress.country_id,
        ZipCode: shippingAddress.postcode,
        DayPhoneNo: shippingAddress.telephone,
        FirstName: shippingAddress.firstname,
        LastName: shippingAddress.lastname,
      },
    };
    if (
      params.shipping_method != "instore_pickup" &&
      params.shipping_method != "flatrate_flatrate"
    ) {
      let carrierTyep = await getCarrierDetails(params.shipping_method);
      payload["SCAC"] = carrierTyep[0].OMS_SCAC;
      payload["CarrierServiceCode"] = carrierTyep[0].Carrier_and_Service;
      console.log("SCAC", carrierTyep[0].OMS_SCAC);
      console.log("Carrier_and_Service", carrierTyep[0].Carrier_and_Service);
    }
    if (base_grand_total > holdAmount) {
      payload["HoldFlag"] = true;
      payload["OrderHoldTypes"] = {
        OrderHoldType: [
          {
            HoldType: "Commerce_Hold",
            ReasonText: "Order Price is more than " + holdAmount,
          },
        ],
      };
    }

    console.log("payload here is", JSON.stringify(payload));

    let response = {
      validPayload: true,
      payload,
    };
    return response;
  } catch (e) {
    console.log("createOrderPayload :" + e);
    let response = {
      validPayload: false,
      message: e,
      payload: params,
    };
    return response;
  }
}

function changeOrderPayload(params, userDetails) {
  const { OrderNo, HoldType } = params;
  const payload = {
    DocumentType: "0001",
    EnterpriseCode: userDetails.orgId,
    OrderNo: OrderNo,
    OrderHoldTypes: [
      {
        OrderHoldType: {
          HoldType: HoldType,
          Status: "1300",
        },
      },
    ],
  };
  return payload;
}

async function stockDetailPayload(params, userDetails) {
  const { nodes, items } = params.data;
  console.log("details", items);
  let ShipNode = [];
  if (nodes && nodes.length > 0) {
    nodes.map((item) => {
      ShipNode.push({
        Node: item,
      });
    });
  }
  let PromiseLine = [];
  if (items && items.length > 0) {
    items.map((e) => {
      const q = {
        ItemID: e.itemId,
        LineId: e.lineId,
        UnitOfMeasure: "EACH",
      };
      PromiseLine.push(q);
    });
  }
  const payload = {
    OrganizationCode: userDetails.orgId,
    PromiseLines: {
      PromiseLine: PromiseLine,
    },
    ShipNodes: {
      ShipNode,
    },
  };
  return payload;
}

async function shipmentPayload(params) {
  const {
    carrierServiceCode,
    SCAC,
    scacAndService,
    shipmentNo,
    containers,
    confirmShip,
    shipments,
  } = params.data;
  const containerSet = [];
  containers.map((item) => {
    let containerObj = {
      ContainerNo: item.containerNo,
      TrackingNo: item.trackingNo,
      ContainerDetails: {
        ContainerDetail: {
          ItemID: item.itemId,
          Quantity: item.containerQty,
          UnitOfMeasure: "EACH",
          ShipmentLine: {
            ShipmentLineNo: item.shipLineNo,
            ShipmentSubLineNo: item.shipSubLineNo,
          },
        },
      },
    };
    containerSet.push(containerObj);
  });

  const shipmentSet = [];
  shipments.map((item) => {
    let shipmentObj = {
      OrderHeaderKey: item.orderHeaderKey,
      OrderLineKey: item.orderLineKey,
      Quantity: item.shipQty,
      OrderReleaseKey: item.orderReleaseKey,
      ShipmentLineNo: item.shipLineNo,
      ShipmentSubLineNo: item.shipSubLineNo,
    };
    shipmentSet.push(shipmentObj);
  });

  const payload = {
    CarrierServiceCode: carrierServiceCode,
    SCAC,
    ScacAndService: scacAndService,
    ShipmentNo: shipmentNo,
    ConfirmShip: confirmShip,
    Containers: {
      Container: containerSet,
    },
    ShipmentLines: {
      ShipmentLine: shipmentSet,
    },
  };

  return payload;
}

async function confirmShipmentPayload(params, userDetails) {
  const { shipNode, shipmentNo, shipQty, nonShipQtyCase, shipmentLines } =
    params.data;

  let payload = {
    ShipmentNo: shipmentNo,
    ShipNode: shipNode,
    SellerOrganizationCode: userDetails.orgId,
    ShipmentLines: {
      ShipmentLine: shipmentLines,
    },
  };
  if (nonShipQtyCase.length) {
    if (nonShipQtyCase === "cancel") {
      payload["CancelNonShippedQuantity"] = "Y";
    } else if (nonShipQtyCase === "backorder") {
      payload["BackOrderNonShippedQuantity"] = "Y";
    }
  }

  return payload;
}

async function cancelShipmentQtyPayload(params) {
  const { orderHeaderKey, orderLines } = params.data;
  let orderLinesArr = [];
  orderLines.map((item) => {
    let orderLineObj = {
      Action: "CANCEL",
      StatusQuantity: item.shipQty,
      FromStatus: "3200",
      OrderLineKey: item.orderLineKey,
      ToStatus: "9000",
    };
    orderLinesArr.push(orderLineObj);
  });

  let payload = {
    OrderHeaderKey: orderHeaderKey,
    OrderLines: {
      OrderLine: orderLinesArr,
    },
  };
  console.log("payload", payload);

  return payload;
}

async function orderShippedResponse(data) {
  return {
    data: data,
  };
}

async function createReserveInventoryPayload(params, adminDetails) {
  let promiseLines = [];
  params.items.map((item, index) => {
    promiseLines.push({
      DeliveryMethod: "PICK",
      ItemID: item.product_id,
      LineId: index + 1,
      ShipNode: params.nodeId,
      RequiredQty: item.qty_ordered,
      UnitOfMeasure: "EACH",
    });
  });

  const data = {
    OrganizationCode: adminDetails.orgId,
    ReservationParameters: {
      AllowMultipleReservations: "Y",
      AllowPartialReservation: "Y",
      ReservationID: `reservation-${params.items[0].order_id}`,
    },
    PromiseLines: {
      PromiseLine: promiseLines,
    },
  };
  return data;
}
async function createReserveInventoryPayloadHook(
  params,
  reservationExpireMins,
) {
  let promiseLines = [];
  let momentOne = moment();
  let expirationDateTime = momentOne
    .utc()
    .add(reservationExpireMins, "minutes");

  params.items.map((item, index) => {
    promiseLines.push({
      DeliveryMethod: "PICK",
      ItemID: item.product_id,
      LineId: index + 1,
      ShipNode: params.nodeId,
      RequiredQty: item.qty_ordered,
      UnitOfMeasure: "EACH",
    });
  });

  const data = {
    OrganizationCode: params.orgId,
    ReservationParameters: {
      AllowMultipleReservations: "Y",
      AllowPartialReservation: "Y",
      ReservationID: params.reservationId,
      ExpirationDate: expirationDateTime.format("YYYY-MM-DD[T]HH:mm:ss"),
    },
    PromiseLines: {
      PromiseLine: promiseLines,
    },
  };
  return data;
}

async function cancelOrderPayload(data, userDetails, documentType) {
  return {
    DocumentType: documentType ? documentType : "0001",
    EnterpriseCode: userDetails.orgId,
    OrderNo: data.OrderNo,
  };
}

async function returnOrderPayload(
  params,
  omsOrderDetails,
  logger,
  shipping_incl_tax,
  discount_amount,
) {
  try {
    const { entity_id, items, order_id } = params.data.value;
    const {
      OrderLines,
      EnterpriseCode,
      SellerOrganizationCode,
      OrderStatuses,
    } = omsOrderDetails;
    const OrderLine = [];

    const oauth = await getOauth(params, logger);
    const orderItems = await getOrderItemDetails(oauth, order_id);
    items.map(async (item) => {
      const itemDetails = orderItems.filter(
        (line) => line.item_id == item.order_item_id,
      );
      const lineItem = OrderLines.OrderLine.filter(
        (line) => line.Item.ItemID == itemDetails[0].product_id,
      );
      const ShipNode = OrderStatuses.OrderStatus.filter(
        (line) => line.OrderLineKey == lineItem[0].OrderLineKey,
      )[0].ShipNode;
      let orderLinePayload = {
        OrderedQty: item.qty_requested,
        ReturnReason: item.reason,
        DerivedFrom: {
          OrderLineKey: lineItem[0].OrderLineKey,
        },
        ShipNode,
      };
      OrderLine.push(orderLinePayload);
    });
    let payload = {
      OrderNo: entity_id,
      DocumentType: "0003",
      DraftOrderFlag: "N",
      EnterpriseCode,
      SellerOrganizationCode,
      DefaultCustomerInformation: "Y",
      ProcessPaymentOnReturnOrder: "Y",
      BillToKey: omsOrderDetails.BillToKey,
      ShipToKey: omsOrderDetails.ShipToKey,
      OrderLines: {
        OrderLine,
      },
      HeaderCharges: {
        HeaderCharge: [
          {
            ChargeCategory: "Shipping",
            ChargeName: "",
            ChargeAmount: Math.abs(shipping_incl_tax),
          },
          {
            ChargeCategory: "Discount",
            ChargeName: "",
            ChargeAmount: Math.abs(discount_amount),
          },
        ],
      },
    };
    return payload;
  } catch (e) {
    let response = {
      message: e,
      payload: params,
    };
    return response;
  }
}

async function changeOrderStatusPayload(params, omsOrderDetails, key, logger) {
  try {
    const { entity_id, items, order_id } = params.data.value;
    const { OrderLines, EnterpriseCode } = omsOrderDetails;
    const OrderLine = [];

    const type = await selectType(key);
    const { BaseDropStatus, TransactionId } = type;

    console.log(key, type);
    const oauth = await getOauth(params, logger);
    const orderItems = await getOrderItemDetails(oauth, order_id);

    items.map(async (item) => {
      const itemDetails = orderItems.filter(
        (line) => line.item_id == item.order_item_id,
      );

      const lineItem = OrderLines.OrderLine.filter(
        (line) => line.Item.ItemID == itemDetails[0].product_id,
      );
      let orderLinePayload = {
        BaseDropStatus,
        Quantity: lineItem[0].OrderedQty,
        PrimeLineNo: lineItem[0].PrimeLineNo,
        SubLineNo: lineItem[0].SubLineNo,
      };
      OrderLine.push(orderLinePayload);
    });
    let payload = {
      EnterpriseCode,
      DocumentType: "0003",
      OrderNo: entity_id,
      TransactionId,
      OrderLines: {
        OrderLine,
      },
    };
    logger.info("change order status payload: " + JSON.stringify(payload));

    return payload;
  } catch (e) {
    let response = {
      message: e,
      payload: params,
    };
    return response;
  }
}

async function changeOrderStatusMemoPayload(params, omsOrderDetails, key) {
  try {
    const { items } = params.data.value;
    const { OrderLines, EnterpriseCode, OrderNo, OrderHeaderKey } =
      omsOrderDetails;
    const OrderLine = [];

    const type = await selectType(key);
    const { BaseDropStatus, TransactionId } = type;

    console.log(key, type);
    items.map(async (item) => {
      const lineItem = OrderLines.OrderLine.filter(
        (line) => line.Item.ItemID == item.product_id,
      );
      let orderLinePayload = {
        BaseDropStatus,
        Quantity: lineItem[0].OrderedQty,
        PrimeLineNo: lineItem[0].PrimeLineNo,
        SubLineNo: lineItem[0].SubLineNo,
        OrderLineKey: lineItem[0].OrderLineKey,
        ChangeForAllAvailableQty: "Y",
      };
      OrderLine.push(orderLinePayload);
    });
    let payload = {
      EnterpriseCode,
      DocumentType: "0003",
      OrderNo,
      OrderHeaderKey,
      TransactionId,
      OrderLines: {
        OrderLine,
      },
    };
    return payload;
  } catch (e) {
    let response = {
      message: e,
      payload: params,
    };
    return response;
  }
}

async function findReceiptPayload(params, omsReturnOrderDetails) {
  try {
    const { entity_id } = params.data.value;
    const { OrderHeaderKey, EnterpriseCode, OrderLines } =
      omsReturnOrderDetails;

    let payload = {
      OpenReceiptFlag: "Y",
      Shipment: {
        EnterpriseCode,
        DocumentType: "0003",
        OrderNo: entity_id,
        OrderHeaderKey,
      },
      DocumentType: "0003",
      ReceivingNode: OrderLines.OrderLine[0].ShipNode,
      TransactionId: "RECEIVE_RECEIPT.0003",
    };
    console.log("findReceipt", payload);
    return payload;
  } catch (e) {
    let response = {
      message: e,
      payload: params,
    };
    return response;
  }
}

async function startReceiptPayload(params, omsOrderDetails) {
  try {
    const { entity_id } = params.data.value;
    const {
      OrderLines,
      EnterpriseCode,
      OrderHeaderKey,
      SellerOrganizationCode,
    } = omsOrderDetails;

    let payload = {
      DocumentType: "0003",
      ReceiptNo: `Receipt-${entity_id}`,
      ReceivingNode: OrderLines.OrderLine[0].ShipNode,
      ReceiptDate: moment(new Date()).format("YYYY-MM-DD"),
      Shipment: {
        EnterpriseCode,
        DocumentType: "0003",
        OrderNo: entity_id,
        OrderHeaderKey,
        SellerOrganizationCode,
      },
    };
    return payload;
  } catch (e) {
    let response = {
      message: e,
      payload: params,
    };
    return response;
  }
}
async function startReceiptPayloadMultiNode(
  params,
  omsOrderDetails,
  node,
  index = 0,
) {
  try {
    const { entity_id } = params.data.value;
    const {
      OrderLines,
      EnterpriseCode,
      OrderHeaderKey,
      SellerOrganizationCode,
    } = omsOrderDetails;

    let payload = {
      ReceiptHeaderKey: "Receipt_RO_" + entity_id + "_" + index,
      DocumentType: "0003",
      ReceiptNo: `Receipt-${entity_id}` + index,
      ReceivingNode: node,
      ReceiptDate: moment(new Date()).format("YYYY-MM-DD"),
      Shipment: {
        EnterpriseCode,
        DocumentType: "0003",
        OrderNo: entity_id,
        OrderHeaderKey,
        SellerOrganizationCode,
      },
    };
    return payload;
  } catch (e) {
    let response = {
      message: e,
      payload: params,
    };
    return response;
  }
}
async function receiveOrderPayload(
  params,
  omsOrderDetails,
  receiptResp,
  logger,
) {
  try {
    const { OrderLines } = omsOrderDetails;
    const { items, order_id } = params.data.value;
    const { ReceiptNo, ReceivingNode, ReceiptHeaderKey } = receiptResp;
    const receiptLine = [];

    const oauth = await getOauth(params, logger);
    const orderItems = await getOrderItemDetails(oauth, order_id);

    items.map(async (item) => {
      const itemDetails = orderItems.filter(
        (line) => line.item_id == item.order_item_id,
      );
      console.log("itemDetails", itemDetails);
      const lineItem = OrderLines.OrderLine.filter(
        (line) => line.Item.ItemID == itemDetails[0].product_id,
      );
      console.log("lineItem", lineItem);
      let orderLinePayload = {
        PrimeLineNo: lineItem[0].PrimeLineNo,
        SubLineNo: lineItem[0].SubLineNo,
        OrderLineKey: lineItem[0].OrderLineKey,
        ItemID: lineItem[0].Item.ItemID,
        UnitOfMeasure: lineItem[0].Item.UnitOfMeasure,
        Quantity: lineItem[0].OrderedQty,
        ProductClass: lineItem[0].Item.ProductClass,
        DispositionCode: "",
      };
      receiptLine.push(orderLinePayload);
    });

    let payload = {
      DocumentType: "0003",
      ReceiptNo,
      ReceivingNode,
      ReceiptHeaderKey,
      ReceiptLines: {
        ReceiptLine: receiptLine,
      },
    };
    return payload;
  } catch (e) {
    let response = {
      message: e,
      payload: "",
    };
    return response;
  }
}
async function receiveOrderPayloadMultiNode(
  params,
  omsOrderDetails,
  receiptResp,
  logger,
  orderLine,
) {
  try {
    const { OrderLines } = omsOrderDetails;
    const { items, order_id } = params.data.value;
    const { ReceiptNo, ReceivingNode, ReceiptHeaderKey } = receiptResp;
    const receiptLine = [];

    const oauth = await getOauth(params, logger);
    const orderItems = await getOrderItemDetails(oauth, order_id);

    // items.map(async (item) => {
    //   const itemDetails = orderItems.filter(
    //     (line) => line.item_id == item.order_item_id,
    //   );
    //   console.log("itemDetails", itemDetails);
    //   const lineItem = OrderLines.OrderLine.filter(
    //     (line) => line.Item.ItemID == itemDetails[0].product_id,
    //   );
    console.log("lineItem", orderLine);
    let orderLinePayload = {
      PrimeLineNo: orderLine.PrimeLineNo,
      SubLineNo: orderLine.SubLineNo,
      OrderLineKey: orderLine.OrderLineKey,
      ItemID: orderLine.Item.ItemID,
      UnitOfMeasure: orderLine.Item.UnitOfMeasure,
      Quantity: orderLine.OrderedQty,
      ProductClass: orderLine.Item.ProductClass,
      DispositionCode: "",
    };
    receiptLine.push(orderLinePayload);
    // });

    let payload = {
      DocumentType: "0003",
      ReceiptNo,
      ReceivingNode,
      ReceiptHeaderKey,
      ReceiptLines: {
        ReceiptLine: receiptLine,
      },
    };
    return payload;
  } catch (e) {
    let response = {
      message: e,
      payload: "",
    };
    return response;
  }
}
async function closeReceiptPayloadultiNode(omsOrderDetails, receiptResp) {
  try {
    const { OrderHeaderKey } = omsOrderDetails;
    const { ReceiptNo, ReceivingNode, ReceiptHeaderKey } = receiptResp;

    let payload = {
      DocumentType: "0003",
      ReceiptNo,
      ReceivingNode,
      ReceiptHeaderKey,
      Shipment: {
        OrderHeaderKey,
      },
    };

    return payload;
  } catch (e) {
    let response = {
      message: e,
      payload: "",
    };
    return response;
  }
}
async function closeReceiptPayload(omsOrderDetails, receiptResp) {
  try {
    const { OrderHeaderKey } = omsOrderDetails;
    const { ReceiptNo, ReceivingNode, ReceiptHeaderKey } = receiptResp;

    let payload = {
      DocumentType: "0003",
      ReceiptNo,
      ReceivingNode,
      ReceiptHeaderKey,
      Shipment: {
        OrderHeaderKey,
      },
    };

    return payload;
  } catch (e) {
    let response = {
      message: e,
      payload: "",
    };
    return response;
  }
}

async function changeOrderCreditPayload(
  params,
  userDetails,
  omsReturnOrderDetail,
  adobeOrder,
) {
  try {
    const { grand_total } = params.data.value.invoice;
    const { OrderNo, BillToKey, ShipToKey } = omsReturnOrderDetail;

    let payload = {
      EnterpriseCode: userDetails.orgId,
      DocumentType: "0003",
      OrderNo,
      PaymentMethods: {
        PaymentMethod: [
          {
            CreditCardNo: adobeOrder.payment.cc_last4,
            PaymentType: "CREDIT_CARD",
            ChargeSequence: "1",
            PaymentDetailsList: {
              PaymentDetails: [
                {
                  ChargeType: "CHARGE",
                  RequestAmount: `-${grand_total}`,
                  ProcessedAmount: `-${grand_total}`,
                },
              ],
            },
            BillToKey,
            ShipToKey,
          },
        ],
      },
    };

    return payload;
  } catch (e) {
    let response = {
      message: e,
      payload: "",
    };
    return response;
  }
}

async function generateInvoicePayload(params, returnOrder) {
  try {
    const { OrderLines, EnterpriseCode, OrderNo } = returnOrder;
    const { items } = params.data.value;
    console.log("orderLine", JSON.stringify(returnOrder));

    let orderLine = [];

    items.map((item) => {
      const filteredItem = OrderLines.OrderLine.filter(
        (line) => line.Item.ItemID == item.product_id,
      );
      orderLine.push({
        PrimeLineNo: filteredItem[0].PrimeLineNo,
        SubLineNo: filteredItem[0].SubLineNo,
        Quantity: filteredItem[0].OrderedQty,
      });
    });

    let payload = {
      EnterpriseCode,
      DocumentType: "0003",
      OrderNo,
      TransactionId: "CREATE_ORDER_INVOICE.0003",
      IgnoreStatusCheck: "Y",
      OrderLines: {
        OrderLine: orderLine,
      },
    };

    return payload;
  } catch (e) {
    let response = {
      message: e,
      payload: "",
    };
    return response;
  }
}

async function recordInvoiceCreationPayload(params, omsOrderDetails) {
  const { DocumentType, OrderNo, OrderHeaderKey, EnterpriseCode, OrderLines } =
    omsOrderDetails;
  const { items } = params;
  console.log("amount", JSON.stringify(-params.discount_amount));

  let lineItems = [];

  async function filterItem(itemId) {
    let filteredItem = OrderLines.OrderLine.filter(
      (item) => item.Item.ItemID === itemId,
    );
    return filteredItem[0];
  }

  items.map((item) => {
    lineItems.push({
      Quantity: item.qty,
      SubLineNo: filterItem(item.product_id).SubLineNo,
      PrimeLineNo: filterItem(item.product_id).PrimeLineNo,
      UnitPrice: Math.abs(item.price),
      // LineChargeList: {
      //   LineCharge: [
      //     {
      //       ChargeCategory: "Discount",
      //       ChargePerLine: Math.abs(item.discount_amount),
      //       Reference: "Adobe discount",
      //     },
      //   ],
      // },
    });
  });

  let payload = {
    EnterpriseCode: EnterpriseCode,
    DocumentType: DocumentType,
    OrderNo: OrderNo,
    OrderHeaderKey: OrderHeaderKey,
    InvoiceType: "PRO_FORMA",
    Currency: Math.abs(params.order_currency_code),
    LineDetails: {
      LineDetail: lineItems,
    },
    HeaderChargeList: {
      HeaderCharge: [
        {
          ChargeCategory: "Shipping",
          ChargeName: "",
          ChargeAmount: Math.abs(params.base_shipping_amount),
          Reference: "Adobe Shipping",
        },
        {
          ChargeCategory: "Discount",
          ChargeName: "",
          ChargeAmount: Math.abs(params.discount_amount),
          Reference: "Adobe discount",
        },
      ],
    },
  };
  console.log("recordInvoiceCreationPayload", JSON.stringify(payload));
  return payload;
}

async function recordInvoiceCreationMemoPayload(
  params,
  userDetails,
  omsOrderDetails,
) {
  const { DocumentType, OrderNo, OrderHeaderKey, EnterpriseCode, OrderLines } =
    omsOrderDetails;
  const { items } = params;

  let lineItems = [];
  // let headerItem = [];
  async function filterItem(itemId) {
    let filteredItem = OrderLines.OrderLine.filter(
      (item) => item.Item.ItemID === itemId,
    );
    return filteredItem[0];
  }

  items.map((item) => {
    lineItems.push({
      Quantity: item.qty,
      SubLineNo: filterItem(item.product_id).SubLineNo,
      PrimeLineNo: filterItem(item.product_id).PrimeLineNo,
      UnitPrice: JSON.stringify(-item.price),
      // LineChargeList: {
      //   LineCharge: [
      //     {
      //       ChargeCategory: "Discount",
      //       ChargePerLine: -Math.abs(item.discount_amount),
      //       Reference: "Adobe Discount",
      //     },
      //   ],
      // },
    });
  });

  let payload = {
    EnterpriseCode: EnterpriseCode,
    DocumentType: DocumentType,
    OrderNo: OrderNo,
    OrderHeaderKey: OrderHeaderKey,
    InvoiceType: "PRO_FORMA",
    Currency: params.order_currency_code,
    LineDetails: {
      LineDetail: lineItems,
    },
    HeaderChargeList: {
      HeaderCharge: [
        {
          ChargeCategory: "Shipping",
          ChargeName: "",
          ChargeAmount: -Math.abs(params.shipping_incl_tax),
          Reference: "Adobe Shipping",
        },
        {
          ChargeCategory: "Discount",
          ChargeName: "",
          ChargeAmount: -Math.abs(params.discount_amount),
          Reference: "Adobe Discount",
        },
      ],
    },
  };
  console.log("recordInvoiceCreationPayload", JSON.stringify(payload));
  return payload;
}

async function recordExternalChargesPayload(
  params,
  userDetails,
  adobeDetails,
  orderId,
  type,
) {
  let CreditCardNo = adobeDetails.payment.cc_last4;
  let PaymentTypeTemp = "";
  if (
    adobeDetails.payment &&
    adobeDetails.payment.extension_attributes &&
    adobeDetails.payment.extension_attributes.vault_payment_token &&
    adobeDetails.payment.extension_attributes.vault_payment_token.type
  ) {
    PaymentTypeTemp =
      adobeDetails.payment.extension_attributes.vault_payment_token.type;
  }
  // }
  // let PaymentTypeTemp =
  //   adobeDetails.payment.extension_attributes.vault_payment_token .type;
  let transactionId = "";
  const riskDataId =
    adobeDetails.extension_attributes.payment_additional_info.filter(
      (item) => item.key == "riskDataId",
    );
  if (riskDataId && riskDataId.value) {
    transactionId = riskDataId.value;
  }
  let PaymentType = PaymentTypeTemp == "card" ? "CREDIT_CARD" : "Other";
  let payload = {
    EnterpriseCode: userDetails.orgId,
    DocumentType: "0001",
    OrderNo: orderId,
    PaymentMethod: {
      CreditCardNo: CreditCardNo,
      PaymentType: PaymentType,
      PaymentDetailsList: {
        PaymentDetails: {
          AuthorizationID: transactionId, //riskDataId =Transaction ID in Adobe Commerce
          ChargeType: "CHARGE",
          ProcessedAmount:
            type === "memo"
              ? params.data.value.base_grand_total
              : `-${adobeDetails.total_refunded}`,
          RequestAmount:
            type === "memo"
              ? params.data.value.base_grand_total
              : `-${adobeDetails.total_refunded}`,
        },
      },
    },
  };
  return payload;
}

async function invoicePayload(orderItemIdArray) {
  let invoicePayloadTemp = JSON.stringify({
    capture: true,
    items: orderItemIdArray,
    notify: true,
    appendComment: true,
    comment: {
      comment: "adding invoice from backend",
      is_visible_on_front: 0,
    },
  });
  return invoicePayloadTemp;
}

async function memoACPayload(orderDetails, invoice, comment) {
  try {
    let shipAmount = invoice.base_shipping_amount
      ? invoice.base_shipping_amount
      : 0;
    let memoItems = [];
    let returnStock = [];

    invoice.items.map((item) => {
      const { order_item_id, qty } = item;
      memoItems.push({
        order_item_id: order_item_id,
        qty: qty,
      });
      returnStock.push(order_item_id);
    });

    let payload = {
      isOnline: true,
      notify: true,
      appendComment: true,
      items: memoItems,
      comment: {
        comment,
        is_visible_on_front: 1,
      },
      arguments: {
        shipping_amount: shipAmount,
        extension_attributes: {
          return_to_stock_items: returnStock,
        },
      },
    };
    console.log("payload", payload);

    return payload;
  } catch (e) {
    let response = {
      message: e,
      payload: "",
    };
    return response;
  }
}

export {
  prepareOrderStatusChangeResponse,
  createOrderPayload,
  changeOrderPayload,
  stockDetailPayload,
  orderShippedResponse,
  shipmentPayload,
  cancelShipmentQtyPayload,
  confirmShipmentPayload,
  createReserveInventoryPayload,
  cancelOrderPayload,
  returnOrderPayload,
  changeOrderStatusPayload,
  findReceiptPayload,
  startReceiptPayload,
  receiveOrderPayload,
  closeReceiptPayload,
  changeOrderCreditPayload,
  generateInvoicePayload,
  invoicePayload,
  memoACPayload,
  recordInvoiceCreationPayload,
  recordExternalChargesPayload,
  changeOrderStatusMemoPayload,
  recordInvoiceCreationMemoPayload,
  createReserveInventoryPayloadHook,
  startReceiptPayloadMultiNode,
  receiveOrderPayloadMultiNode,
  closeReceiptPayloadultiNode,
};
