# StockSync Description

This Runtime Action is intended to maintain sync of inventory between adobe sytem and oms system.The OMS sytem will send delta sync and full events. In delta sync the events will be sent everytime as the rule applied in oms system to 10,100 or 1000. In full sync there will 24 hourly sync where an event will be sent to appbuilder and the same will be updated in Adobe Sytem by api. This is subscribed to "ibm.sterling.adobe.stock_change.v0" event. 


## Prequisite Steps

  1. This ibm.sterling.adobe.stock_change.v0 is trigerred from OMS system as delta sync and full sync.
  2. This action will receive the event and call adobe's api and update the Adobe System .

- ## Request: 
   {
    "data":{
      sku: sku,
      source_code: e.Node,
      quantity: e.OnhandAvailableQuantity,
      status: status
          }
    };

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
