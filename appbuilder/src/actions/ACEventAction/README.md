# ACEvent Runtime Description

This runtime action gets triggered when ac triggers the events.The actions are binded to this particular action based on the type of the event.


## Explanation: 

- ## Type=com.adobe.commerce.observer.sales_order_save_commit_after:
    ACCreateOrder runtime gets called when order is getting created from Adobe Commerce.

- ## Type=com.adobe.commerce.observer.rma_save_commit_after:
    ACReturnOrder runtime action gets called whenever return is created from the Adobe Commerce.

- ## Type=com.adobe.commerce.observer.sales_order_creditmemo_save_commit_after:
    ACCreditMemo runtime action gets called credit memo is generated in Adobe Commerce.

- ## Type=com.adobe.commerce.observer.sales_order_invoice_save_commit_after:
    ACOrderInvoice runtime action gets called credit memo is generated in Adobe Commerce.
    
- ## if no event or event with incorrect name gets triggered:
    This will return success status with message EVENT NAME NOT DETECTED. 

- ## if any error occurs:
    This will get handled in the catch block and 500 status code with message server error for event and type will be returned.
