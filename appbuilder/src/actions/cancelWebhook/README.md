# OrderHoldAC Description

This Runtime Action is intended to cancel the order in Adobe and OMS sytem. An order can be cancelled only in the specified time frame.Cancel Order is initiated by canWebhook which cancels the order in OMS and basd on the response cancelorder api of Adobe is called. This is subscribed to "ibm.sterling.adobe.cancel_order.v0" event.

## Prequisite Steps

1. The earliestScheduledate variable should be sent in CreateOrder api which not release the order in the given time.
2. This webhook will first cancel the order in OMS system and based on the response will synchronously call the cancelOrder api of Adobe Commerce.

## CancelOrderOMS

- ## Request:

 {"data":
 {
  "OrderNo":383
  }
}

- ## Response:
  1. In case of Success
     {
     "OrderLines": {
     "OrderLine": [
     {
     "StopDeliveryQty": "0.00",
     "OrderHeaderKey": "202308230642212307174",
     "OrderedQty": "0.00"
     }
     ]
     },
     "DocumentType": "0001",
     "OrderNo": "364",
     "EnterpriseCode": "TenantB"
     }
  2. If case of Failure
     {
     "errors": [
     {
     "ErrorDescription": "YFS: Order cannot be modified in current status",
     "ErrorCode": "YFS10137",
     "MoreInfo": {
     "ModificationType": "CANCEL",
     "ModificationLevel": "ORDER",
     "DocumentType": "0001",
     "OrderNo": "363",
     "OrderHeaderKey": "202308230640212306829",
     "EnterpriseCode": "TenantB",
     "Override": ""
     },
     "httpcode": 400
     }
     ]
     }

## cancelOrderAC

- ## endpoint: orders/{id}/cancel
  id is here is orderno which is retrived from oms cancelorder api whose order is cancelled 

- ## Response:
  1. In case of Success
     {
     "message": "Order has been cancelled in Adobe Commerce"
     }
