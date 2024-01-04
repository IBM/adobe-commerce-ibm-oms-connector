# OMSEvent Runtime Description

This runtime action gets triggered when oms triggers the events.The actions are binded to this particular action based on the type of the event.


## Explanation: 

- ## Type=ibm.sterling.oms.test_event.v0:
    This runtime action was used for testing purposes when event's triggers were coming from oms.

- ## Type=ibm.sterling.adobe.order_status_change.v0:
    This runtime action gets triggered when the status of the order is changed.

- ## Type=ibm.sterling.adobe.shipment_request.v0:
    This runtime action gets triggered when order gets released in OMS system and trigger is sent to appbuilder to capture.

- ## Type=ibm.sterling.adobe.shipment_change.v0:
    This runtime action gets triggered when shipment gets created and confirmed from the warehouse.

- ## Type=iibm.sterling.adobe.shipment_shipped.v0:
    This runtime action gets triggered when shipment gets shipped either from store or from warehouse.

- ## Type=ibm.sterling.adobe.stock_change.v0:
ACCreditMemo runtime action gets triggered to sync the inventory in oms as well ad adobe commerce.

- ## Type=ibm.sterling.adobe.order_monitor.v0:
ACCreditMemo runtime action is for getting order montiring alerts.

- ## Type=ibm.sterling.adobe.backorder.v0:
ACCreditMemo runtime action gets called when order is created at adobe commerce but inventory is not present in oms and order gets backordered.

    
- ## if no event or event with incorrect name gets triggered:
    This will return success status with message EVENT NAME NOT DETECTED. 

- ## if any error occurs:
    This will get handled in the catch block and 500 status code with message server error for event and type will be returned.
