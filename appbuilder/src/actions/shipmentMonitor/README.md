Description:This runtime action is intended to monitor shipment updates from OMS.

Prequisite Steps:
1.The shipment updates will be received from OMS end.



Flow:
There are different rules by which alerts are triggered from OMS system if the order has been in released state for than 48hrs etc.
The orderno, order date, status and relevant message why alert is triggered is being returned in the response. 

1.Condition has been written based on the type of alert has been written in if else condition.

2. Based on the condition the type of action can be performed by the SI .
 


RequestBody: {    
                "ConfirmShip": "Y",
                "DocumentType": "0001",
                "OrderReleases": {
                    "OrderRelease": [
                      {
                        "OrderHeaderKey": "20230528072813915775",
                        "ReleaseNo": "1"
                      }
                    ]
                  }       
            }

Response:To be confirmed


# ShipmentMonitor Description


This action is inteded to monitor shipment updates from OMS alerts. 


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



 







    
