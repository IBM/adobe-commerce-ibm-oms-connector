Description: This webhook is intended to get the stock details for listed locations from OMS. This is used in the react component for Source locations and InStore Pickup Locations. 

This is calling inventory/sources API from Adobe Commerce and getAvailableInventory from OMS.


For All these cases base url will be https://48941-sterlingomsapp-tenanta.adobeio-static.net/api/v1/web/oms-commerce-appbuilder/StockDetailOMS with POST method. This url changes based on the tenant.

Request: {
    "data" : {
        "items":[{
        "itemId": "3941",
        "lineId": "1"},
        {
          "itemId": "3942",
          "lineId": "2"
        }],
        "nodes":["tnb_store_1"]
    }
} 

Response: {
    "OrganizationCode": "TenantA",
    "PromiseLines": {
        "PromiseLine": [
            {
                "AutoReplacedByPreferredSubstitute": "N",
                "Availability": {
                    "AvailableInventory": {
                        "AvailableFromUnplannedInventory": "N",
                        "AvailableFutureQuantity": "0.00",
                        "AvailableOnhandQuantity": "26.00",
                        "AvailableQuantity": "26.00",
                        "EndDate": "2023-08-10",
                        "ShipNodeAvailableInventory": {
                            "Inventory": {
                                "AvailableFromUnplannedInventory": "N",
                                "AvailableFutureQuantity": "0.00",
                                "AvailableOnhandQuantity": "26.00",
                                "AvailableQuantity": "26.00",
                                "Node": "tna_dc_1"
                            }
                        },
                        "StartDate": "2023-07-11"
                    }
                },
                "BundleParentLineId": "",
                "DeliveryMethod": "SHP",
                "DistributionRuleId": "",
                "FulfillmentType": "",
                "IsBundleParent": "N",
                "ItemID": "3941",
                "KitQty": "1.00",
                "LineId": "1",
                "NewItemID": "",
                "ProductClass": "",
                "ReceivingNode": "",
                "Segment": "",
                "SegmentType": "",
                "ShipNode": "tna_dc_1",
                "UnitOfMeasure": "EACH"
            }
        ]
    }
}