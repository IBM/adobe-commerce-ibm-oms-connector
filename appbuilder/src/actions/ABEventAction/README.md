# ACEvent Runtime Description

This runtime action gets triggered when app builder triggers the events.The actions are binded to this particular action based on the type of the event.


## Explanation: 



- ## if Type=ibm.sterling.appbuilder.order_hold.v0:
    ACCreateOrder runtime gets called when order is getting created from Adobe Commerce.


- ## if no event or event with incorrect name gets triggered:
    This will return success status with message EVENT NAME NOT DETECTED. 

- ## if any error occurs:
    This will get handled in the catch block and 500 status code with message server error for event and type will be returned.

