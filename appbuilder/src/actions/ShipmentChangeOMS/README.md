# ShipmentChangeOMS Webhook Description

Warehouse management system will use this runtime action to update shipment details in OMS system.

## Prequisite Steps

  1. Place order in OMS system which should not have any hold
  2. Order should be scheduled and released. During release event all the required details will be passed to WMS which will be used for shipment updates

  For All these cases base url will be ${BASE_URL}/api/v1/web/oms-commerce-appbuilder/ShipmentChangeOMS with POST method.

## Case 1: Create Shipment

- ## Explanation: 
    When wms wants to create shipment for any release this should be the following request. Container details can be defined by WMS. ItemId and shipment details will be sent to WMS system when any order is released. ShipQty is for the quantity that needs to be shipped. ShipmentNo can be decided by WMS based on the item.

- ## Request: 
    {
        "data": {
            "type": "create", // For create shipment
            "confirmShip":"N", // 'Y' for create and complete shipment, "N" for only create shipment
            "carrierServiceCode": "",
            "SCAC": "",
            "scacAndService": "UPSNND",
            "containers": [
                {
                    "containerNo": "C1",
                    "trackingNo": "T1",
                    "itemId": "3941",
                    "containerQty": "6",
                    "shipLineNo": "1",
                    "shipSubLineNo": "0"
                }
            ], 
            "shipments": [
                {
                    "orderHeaderKey": "20230710135112989021",
                    "orderLineKey": "20230710135112989022",
                    "shipQty": "8", 
                    "orderReleaseKey": "20230710135224989094",
                    "shipLineNo": "1",
                    "shipSubLineNo": "0"
                }
            ],
            "shipmentNo": "Shipment306_1"
        }
    }

- ## Response: 
    {
        "SellerOrganizationCode": "TenantA",
        "ShipNode": "tna_dc_1",
        "ShipmentKey": "202308030515141598009",
        "ShipmentNo": "Shipment655_1",
        "id": "202308030515141598009"
    }

## Case 2: Confirm Shipment

- ## Explanation: 
    When wms wants to confirm shipment for any release this should be the following request. If wms system has created the shipment for 8 qty in case1 and out of that 8 it only needs to confirm shipment for 6 and rest 2 qty can be cancel or backorder based on nonShipQtyCase

- ## Request: 
    {
        "data": {
            "type": "confirm", // for confirm shipment
            "shipmentNo": "Shipment306_1", // shipmentNo is the same that was used during create shipment
            "shipNode":"tna_dc_1", // Node from wher release is created
            "shipQty": "6", // qty for which shippment needs to be confirmed
            "nonShipQtyCase": "cancel" // for non ship qty that either needs to be 'cancel' or 'backorder'
        }
    }

## Case 3: Cancel Shipment

- ## Explanation: 
    When wms wants to release the order and cancel the remaining qty which is not shipped. The order will then be in the shipped state. shipQty is the qty used in confirm shipment.

- ## Request: 
    {
        "data": {
            "type": "cancel",
            "orderHeaderKey": "20230710135112989021",
            "orderReleaseKey":"20230710135224989094",
            "orderLines": [
                {
                    "orderLineKey": "20230710135112989022",
                    "shipQty": "6"
                }
            ]
        }
    }
