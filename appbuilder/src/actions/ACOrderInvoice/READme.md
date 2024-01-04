# Adobe Commerce Create Order

This runtime action is intended to generate a PRO FORMA invoice in OMS and record the payment details. This runtime action is linked with sales_order_invoice_save_commit_after of Adobe Cloud system which triggers from Adobe Cloud when invoice is generated in Adobe Commerce. This will listen to the event sales_order_invoice_save_commit_after and then process the further action of creating PRO FORMA invoice and updating payment details into IBM Sterling OMS system.

## Prequisite Steps

   1. Need to create Provider for Adobe Commenrce 
   2. Need sales_order_invoice_save_commit_after Event which binded with provider created for  Adobe Commerce 
   3. Create the Action and register it with Provider and Event created 

- ## Request: 
      {
    "EnterpriseCode": "TenantB",
    "DocumentType": "0001",
    "OrderNo": "629",
    "OrderHeaderKey": "202309271710263763569",
    "InvoiceType": "PRO_FORMA",
    "Currency": "USD",
    "LineDetails": {
      "LineDetail": [{
        "Quantity": "1.000000",
        "UnitPrice": "368.48",
        "LineChargeList": {
          "LineCharge": [{
            "ChargeCategory": "Discount",
            "ChargePerLine": "103.18",
            "Reference": "Adobe discount"
          }]
        }
      }]
    }
  }

- ## Response: 
   {
    "Status": "00",
    "HeaderTax": "0.00",
    "ReturnReleaseKey": " ",
    "CollectedThroughAR": "0.00",
    "InvoiceNo": "7766",
    "TotalAmount": "265.30",
    "HeaderChargeList": {},
    "DateInvoiced": "2023-09-29T11:56:26+00:00",
    "CollectedExternally": " ",
    "InvoiceType": "PRO_FORMA",
    "TaxBreakupList": {},
    "ChargedActualFreight": "N",
    "ShipmentKey": " ",
    "ActualFreightCharge": "0.00",
    "AmountCollected": "0.00",
    "TotalTax": "0.00",
    "ChargeTransactionKey": " ",
    "Reference1": " ",
    "LineDetails": {
        "LineDetail": [
            {
                "OrderInvoiceDetailKey": "20230929118656263861597",
                "UnitPrice": "368.48",
                "ExtendedPrice": "368.48",
                "LineTotal": "265.30",
                "LineDetailTranQuantity": {
                    "TransactionalUOM": "",
                    "ShippedQty": "0.00"
                },
                "Charges": "-103.18",
                "Tax": "0.00",
                "OrderInvoiceKey": "20230929118856263861596",
                "ShippedQty": "1.00",
                "OrderLineKey": " ",
                "LineChargeList": {
                    "LineCharge": [
                        {
                            "ChargePerUnit": "0.00",
                            "InvoicedExtendedCharge": "0.00",
                            "InvoicedChargePerLine": "0.00",
                            "RecordType": "INV",
                            "ChargeCategory": "Discount",
                            "Reference": "Adobe discount",
                            "LineKey": "20230929118656263861597",
                            "HeaderKey": "20230929118856263861596",
                            "ChargeName": " ",
                            "ChargePerLine": "103.18",
                            "ChargeAmount": "103.18",
                            "LineChargesKey": "20230929113156263861598"
                        }
                    ]
                }
            }
        ]
    },
    "LineSubTotal": "368.48",
    "MasterInvoiceNo": " ",
    "OtherCharges": "0.00",
    "OrderHeaderKey": "202309271710263763569",
    "OrderInvoiceKey": "20230929118856263861596"
}



 
