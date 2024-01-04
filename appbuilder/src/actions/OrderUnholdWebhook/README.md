# Order Unhold Webhook

This webhook is intended to remove the hold on the order in OMS Sterling. This is not binded to any provider or event. It ise secured using adobe basic auth. To access this you need to send the organizationId with the following key "x-gw-ims-org-id" along with the oauth access token. This token can generated from the Adobe developer for that specific merchant


## Prequisite Steps

  1. The order that is triggered from Adobe and created in OMS Sterling with hold status.
  2. This action will remove hold fom that order in IBM Sterling.
  3. It calls changeOrder API for unhold any order

- ## URL For this webhook 

  {BASE_URL}/api/v1/web/oms-commerce-appbuilder/OrderUnholdWebhook
  BASE_URL will be specific to Merchant

- ## Request: 
  {
    "data": {
        "OrderNo": 674,
        "HoldType": "Commerce_Hold"
    }
  }

- ## Response: 
   
  1. Status Code 200 
    {
      "DocumentType": "0001",
      "EnterpriseCode": "TenantA",
      "OrderHeaderKey": "202308160854372123376",
      "OrderNo": "674",
      "id": "202308160854372123376"
    }

  2. Status Code 403

    {
      "error": "request is invalid, reason: failed authorization. Please verify your token and organization id."
    }
