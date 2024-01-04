# OrderHoldAC Description

This Runtime Action is intended to put the hold on the order when order price is more than 500$. This is triggered from create order runtime action when total price is more than the allowed price and this action calls the Adobe API to put the hold on order and update the same in order comments in Adobe commerce. This is subscribed to "ibm.sterling.appbuilder.order_hold.v0" event. 


## Prequisite Steps

  1. The order that is triggered from Adobe and created in OMS Sterling.
  2. This action will put the order on hold in Adobe commerce when price is more than the mentioned price.

- ## Request: 
  {
    "orderId": 140
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
