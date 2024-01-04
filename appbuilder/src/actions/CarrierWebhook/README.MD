Description: This webhook is intended to fetch carrier details. 
//To be updated later on as per api provided by oms team
This is calling findInventory API from OMS.


For All these cases base url will be https://48941-sterlingomsapp-tenanta.adobeio-static.net/api/v1/web/oms-commerce-appbuilder/deliveryTimeWebhook with POST method. This url changes based on the tenant.

Request: {
    "data" :   ShipToAddress: {
              Country: US,
              ZipCode: 411021
            },
            ItemID: 3941,
            RequiredQty: 1
        }


Response: {
    "Options": {
        "TotalNumberOfRecords": "0"
    },
    "OptimizationType": "03",
    "DependencyShippingRule": "",
    "SuggestedOption": {
        "Option": {
            "LastDate": "2023-07-06T06:07:35+00:00",
            "OptionNo": "1",
            "NodeQty": "1.00",
            "FirstDate": "2023-07-06T06:07:35+00:00",
            "AvailableFromUnplannedInventory": "N",
            "TotalShipments": "1",
            "Interactions": {
                "Interaction": [
                    {
                        "IsDelivery": "N",
                        "CarrierServiceCode": "",
                        "DeliveryMethod": "SHP",
                        "Node": "tna_dc_1",
                        "DeliveryDate": "2023-07-06T06:07:35+00:00",
                        "ShipDate": "2023-07-06T06:07:35+00:00",
                        "EarliestDate": "2023-07-06T00:00:00+00:00",
                        "LastDate": "2023-08-05T23:59:59+00:00",
                        "ItemGroupCode": "PROD",
                        "PersonInfoShipTo": {
                            "VerificationStatus": "",
                            "Company": "",
                            "OtherPhone": "",
                            "UseCount": "0",
                            "EMailID": "",
                            "DayPhone": "",
                            "JobTitle": "",
                            "MobilePhone": "",
                            "Department": "",
                            "AlternateEmailID": "",
                            "PersonID": "",
                            "PreferredShipAddress": "",
                            "Beeper": "",
                            "FirstName": "",
                            "ZipCode": "411021",
                            "Title": "",
                            "City": "",
                            "MiddleName": "",
                            "DayFaxNo": "",
                            "HttpUrl": "",
                            "AddressLine3": "",
                            "AddressLine2": "",
                            "AddressLine1": "",
                            "Suffix": "",
                            "AddressLine6": "",
                            "AddressLine5": "",
                            "State": "",
                            "AddressLine4": "",
                            "EveningFaxNo": "",
                            "EveningPhone": "",
                            "Country": "US",
                            "ErrorTxt": "",
                            "LastName": "",
                            "isHistory": "N"
                        },
                        "OrganizationCode": "",
                        "Carrier": "",
                        "TotalHandlingUnits": "0.00",
                        "InteractionNo": "1"
                    }
                ],
                "TotalNumberOfRecords": "1"
            },
            "LeastPriority": "1.00",
            "PromiseLines": {
                "PromiseLine": [
                    {
                        "CarrierServiceCode": "",
                        "DeliveryMethod": "SHP",
                        "LineId": "",
                        "UnitOfMeasure": "EACH",
                        "Assignments": {
                            "Assignment": [
                                {
                                    "Procurements": {},
                                    "IsIdleAsset": "N",
                                    "SegmentChangeQty": "0.00",
                                    "ExternalNode": "N",
                                    "ReservedQty": "0.00",
                                    "AvailableFromUnplannedInventory": "N",
                                    "ProcuredQty": "0.00",
                                    "Quantity": "1.00",
                                    "DeliveryDate": "2023-07-06T06:07:35+00:00",
                                    "ShipDate": "2023-07-06T06:07:35+00:00",
                                    "SubstituteItems": {},
                                    "MergeNode": "",
                                    "SCAC": "",
                                    "NodePriority": "1.00",
                                    "ShipNode": "tna_dc_1",
                                    "InteractionNo": "1",
                                    "ProductAvailDate": "2023-07-06",
                                    "Distance": "0.00",
                                    "SubstitutedQty": "0.00"
                                }
                            ],
                            "TotalNumberOfRecords": "1"
                        },
                        "ReceivingNode": "",
                        "IsBundleParent": "N",
                        "ItemID": "3941",
                        "Segment": "",
                        "SegmentType": "",
                        "NewItemID": "",
                        "SCAC": "",
                        "BundleParentLineId": "",
                        "KitQty": "1.00",
                        "RequiredQty": "1",
                        "AutoReplacedByPreferredSubstitute": "N",
                        "DistributionRuleId": "",
                        "ShipNode": "",
                        "ProductClass": "",
                        "FulfillmentType": ""
                    }
                ],
                "TotalNumberOfRecords": "1"
            },
            "MaxPriority": "1.00",
            "PromiseServiceLines": {
                "TotalNumberOfRecords": "0"
            },
            "HasAnyUnavailableQty": "N"
        }
    },
    "OrganizationCode": "TenantA"
}
