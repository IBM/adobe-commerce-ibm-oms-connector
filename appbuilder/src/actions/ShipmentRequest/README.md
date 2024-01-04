# ShipmentRequest Description

  This runtime action is intended to update shipment details coming from Adobe Commerce to OMS sytem via WMS.
  This is subscribed to "ibm.sterling.adobe.shipment_request.v0" event. 


## Prequisite Steps

  1.The shipment gets shipped from Adobe Commerce.
  2.The shipment details gets sent to WMS/DC and the response comes back from WMS
  3.The response from WMS goes back to OMS by createShipment


## Flow:
  When order gets shipped from Adobe Commerce it will send the shipment details(e.g. orderId,release no) to AppBuilder. The AppBuilder will send the shipment details to WMS and WMS will send a response back to AppBuilder. The AppBuilder then calls changeShipment api and it confirms to OMS system that order has been shipped.

  1.swicth case is written on the basis of location (should be in params) 
  The switch(params.location){
        case params.location==location1:
          const shipmentStatus=await callWms()
          if(shipmentStatus.status==200){
            const result=await changeShipment()
          }
          break;

        case params.location==location2:

  2.In const.js Change_Shipment_Demo_Location is given,here the correct locations are to be defined by the SI Team. If the location matches then call WMS api function gets called .

  3. In WMS api function the call will be sent to WMS with required input json/xml and the response coming from WMS will be checked. 

  4. If the status is success, then changeShipement api gets called from OMS ervice. In this call oms api gets called and shipment gets confirmed in oms system.

- ## Request: 
      {    
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

- ## Response: 
  1.Response:To be confirmed




    
