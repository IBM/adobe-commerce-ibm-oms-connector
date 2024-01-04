# Return Runtime Description

This runtime will create returns in Adobe Commerce and OMS Sytem.

## Prequisite Steps

  1. Create a return for the order which is already in complete status.


  Below are the different cases of return based on the status.

## Case 1: status=Pending
    
Create a return for the order which is already in complete status.Initially the return status will be in pending status and the status of the order in oms system will change to return created.


## Case 2: status=Authorized
    
When the return order gets authorized the same status will get updated in the oms system.

## Case 3: status=Return Received
     
When the return order status is return receieved in Adobe Commerce if receit is checked by findrecipt api to check if one exists if not then a new receipt is created by startReceipt

## Case 3: status=Return Received
     
When the return order status is return receieved in Adobe Commerce if receit is checked by findrecipt api to check if one exists if not then a new receipt is created by startReceipt and one new recipt gets created with status open and those details are sent to receive order api and the order status changes to receipt closed.

## Case 4: status=Processed and Closed
     
When order is approved in Adobe Commerce the credit memo is created at adobe commerce and then invoice is generated for that status moves to credit memo generated.The status in oms will move to restocked status and the invoice will be created for the same.


## Case 5: status=closed
     
When order is in return received the order doesn't get cancelled directly the order need to be unreceived in order to get cancelled. The order moves to earlier state shipped and return order lines status gets changed to cancelled.


## Case 6: status=Processed and Closed
     
When order is approved in Adobe Commerce the credit memo is created at adobe commerce and then invoice is generated for that status moves to credit memo generated.The status in oms will move to restocked status and the invoice will be created for the same.


