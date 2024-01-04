# Adobe ACCCreditMemo Order

This runtime action is intended to generate credit memo when return is approved.


## Case 1: return memo
     
When order is approved in Adobe Commerce the credit memo is created at adobe commerce order is changed to approved in oms then payment details are updated by using changeOrder api and invoice is generated in oms after which status is changed to credit memo generated and order status is changed to restocked.


## Case 2: normal memo

When it is a normal memo invoice pro forma invoice is generated in oms  by recordInvoiceCreation api and payment details are captured by recordExternalCharges api. 


## Prequisite Steps

   1. Need to create Provider for Adobe Commenrce 
   2. Need sales_order_invoice_save_commit_after Event which binded with provider created for  Adobe Commerce 
   3. Create the Action and register it with Provider and Event created 






 
