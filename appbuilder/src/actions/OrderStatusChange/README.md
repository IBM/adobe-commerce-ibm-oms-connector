# OrderHoldAC Description

This Runtime Action is intended to update a comment for each order status change in OMS. This is triggered from OMS sterling when there is any change in the order status and this action calls the Adobe API to update the same in Adobe commerce. This is subscribed to "ibm.sterling.adobe.order_status_change.v0" event.


## Prequisite Steps

  1. The order that is triggered from Adobe and created in OMS Sterling.
  2. Any Change in order status in sterling will call this action in APP builder.
  3. This action will update the status in Adobe commerce for the same order.

- ## Request: 
  {
  "data": {
    "orderDetail": {
      "orderId": 140,
      "status": "Order Placed"
    },
    "comment": "Comment from AppBuilder Params"
  }
}

- ## Response: 
  1. In case of Success 
      {
        "data": {
          "commentSaved": true
        },
        "status": "SUCCESS"
      }
  2. If case of Failure 
    {
      error: {
        code: "",
        message: ""
      },
      "status": "false"
    }
