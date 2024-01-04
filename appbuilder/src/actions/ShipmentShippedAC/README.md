# ShipmentShippedAC Description

This runtime action will get triggered when order is set to "Shipped" status in OMS. This will update the statue of order in Adobe commerce.

## Prequisite Steps

  1. Place order in OMS system which should not have any hold
  2. Order should be scheduled, released and shipped.


## Case 1: When Order is normal delivery order 

- ## Explanation: 
    In case of normal delivery order. When order get "SHIPPED" from OMS. This action call /ship API in Adobe commerce

- ## Request: 
  {
    "data": {
      "Shipment": {
        "ShipmentLines": {
          "ShipmentLine": [
            {
              "OrderNo": "294"
            }
          ]
        }
      }
    }
  }

- ## Response: 
  { "body": { "data": { "data": "142" }, "status": "SUCCESS" }, "statusCode": 200 }


## Case 2: When order InStore Pickup Order 

- ## Explanation: 
    While placing the order if user selects in store pickup options and select the particular store for pickup. When order get "SHIPPED" from OMS then this action calls 'notify-orders-are-ready-for-pickup' API to update the status in Adobe commerce

- ## Request: 
  {
    "data": {
      "Shipment": {
        "ShipmentLines": {
          "ShipmentLine": [
            {
              "OrderNo": "294",
              "OrderLine": {
                "DeliveryMethod": 'PICK'
              }
            }
          ]
        }
      }
    }
  }

- ## Response: 
    { "errors": [], "successful": true }

