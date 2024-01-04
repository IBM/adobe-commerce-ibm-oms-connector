# Adobe Commerce Create Order

This runtime action is intended to create order into OMS. This runtime action is linked with sales_order_save_commit_after of Adobe Cloud system which trigger from Adobe Cloud when order is placed into system. This will listen to the event sales_order_save_commit_after and then process the further action of creating order into IBM Sterling OMS system.

## Prequisite Steps

   1. Need to create Provider for Adobe Commenrce 
   2. Need sales_order_save_commit_after Event which bind with provider created for  Adobe Commerce 
   3. Create the Action and register it with Provider and Event created 

- ## Request: 
    {
        "data": {
          "key": "72d7bb75-9003-4fe5-8096-bf62d64c3745",
          "value": {
            "increment_id": "000000617",
            "shipping_method": "flatrate_flatrate",
            "items": [
              {
                "sku": "Adobe_Pro_12",
                "name": "Adobe_Pro_12",
                "is_qty_decimal": false,
                "qty_ordered": 1,
                "quote_item_id": "1088",
                "is_virtual": "0",
                "original_price": 700,
                "applied_rule_ids": "42,43",
                "price": 505.75,
                "base_price": 505.75,
                "tax_percent": 0,
                "tax_amount": 0,
                "row_weight": 0,
                "row_total": 505.75,
                "base_original_price": "700.000000",
                "base_tax_amount": 0,
                "base_row_total": 505.75,
                "store_id": 1,
                "discount_tax_compensation_amount": 0,
                "base_discount_tax_compensation_amount": 0,
                "product_id": "3953",
                "product_type": "simple",
                "price_incl_tax": 505.75,
                "base_price_incl_tax": 505.75,
                "row_total_incl_tax": 505.75,
                "base_row_total_incl_tax": 505.75,
                "free_shipping": false,
                "discount_percent": 20,
                "discount_amount": 101.15,
                "base_discount_amount": 101.15,
                "product_options": {
                  "info_buyRequest": {
                    "uenc": "aHR0cHM6Ly90ZW5hbnRhLWpjb2JneHEtY2g2cWx4NmtrdngzYS51cy00Lm1hZ2VudG9zaXRlLmNsb3VkL2NhdGVnb3J5LTEuaHRtbA,,",
                    "product": "3953",
                    "qty": 1
                  },
                  "giftcard_is_redeemable": 0
                },
                "order_id": "673",
                "item_id": "998",
                "id": "998",
                "created_at": "2023-08-16 08:40:19",
                "updated_at": "2023-08-16 08:40:19"
              }
            ],
            "addresses": [
              {
                "firstname": "Brijesh",
                "lastname": "Pandya",
                "city": "Ahmedabad",
                "region": "Gujarat",
                "region_id": "580",
                "postcode": "380005",
                "country_id": "IN",
                "telephone": "07405147080",
                "email": "brijesh.pandya@ibm.com",
                "address_type": "shipping",
                "street": "29,Stadium Plaza\nMotera Stadium road, Sabarmati",
                "quote_address_id": "2113",
                "parent_id": "673",
                "entity_id": "1343",
                "id": "1343"
              },
              {
                "firstname": "Brijesh",
                "lastname": "Pandya",
                "company": "",
                "city": "Ahmedabad",
                "region": "Gujarat",
                "region_id": 580,
                "postcode": "380005",
                "country_id": "IN",
                "telephone": "07405147080",
                "email": "brijesh.pandya@ibm.com",
                "address_type": "billing",
                "street": "29,Stadium Plaza\nMotera Stadium road, Sabarmati",
                "quote_address_id": "2114",
                "parent_id": "673",
                "entity_id": "1344",
                "id": "1344"
              }
            ],
            "payment": {
              "method": "braintree",
              "cc_type": "VI",
              "cc_exp_month": "02",
              "cc_exp_year": "2024",
              "cc_ss_start_month": "0",
              "cc_ss_start_year": "0",
              "additional_information": {
                "device_data": "{\"correlation_id\":\"706da5435e932e6dcd011040caba783d\"}",
                "method_title": "Brian Tree 1",
                "avsPostalCodeResponseCode": "M",
                "avsStreetAddressResponseCode": "M",
                "cvvResponseCode": "M",
                "processorAuthorizationCode": "RQLW6T",
                "processorResponseCode": "1000",
                "processorResponseText": "Approved",
                "cc_type": "Visa",
                "cc_number": "xxxx-1111",
                "riskDataId": "j0yjwb0m",
                "riskDataDecision": "Approve"
              },
              "cc_last_4": "1111",
              "parent_id": "673",
              "amount_ordered": 409.6,
              "base_amount_ordered": 409.6,
              "shipping_amount": 5,
              "base_shipping_amount": 5,
              "method_instance": [],
              "should_close_parent_transaction": false,
              "base_amount_authorized": 409.6,
              "cc_trans_id": "j0yjwb0m",
              "last_trans_id": "j0yjwb0m",
              "transaction_id": "j0yjwb0m",
              "is_transaction_closed": false,
              "extension_attributes": [],
              "created_transaction": [],
              "amount_authorized": 409.6,
              "entity_id": "673",
              "id": "673"
            },
            "applied_rule_ids": "42,43",
            "base_currency_code": "USD",
            "base_discount_amount": -101.15,
            "base_grand_total": 409.6,
            "base_discount_tax_compensation_amount": 0,
            "base_shipping_amount": 5,
            "base_shipping_discount_amount": 0,
            "base_shipping_discount_tax_compensation_amnt": 0,
            "base_shipping_incl_tax": 5,
            "base_shipping_tax_amount": 0,
            "base_subtotal": 505.75,
            "base_subtotal_incl_tax": 505.75,
            "base_tax_amount": 0,
            "base_to_global_rate": 1,
            "base_to_order_rate": 1,
            "billing_address_id": "1344",
            "created_at": "2023-08-16 08:40:19",
            "customer_email": "brijesh.pandya@ibm.com",
            "customer_firstname": "Brijesh",
            "customer_is_guest": 1,
            "customer_lastname": "Pandya",
            "customer_note_notify": 1,
            "discount_amount": -101.15,
            "discount_description": "",
            "global_currency_code": "USD",
            "grand_total": 409.6,
            "discount_tax_compensation_amount": 0,
            "is_virtual": 0,
            "order_currency_code": "USD",
            "protect_code": "f5f8befc066c52a8c44535b35da60575",
            "quote_id": "730",
            "remote_ip": "129.41.59.2",
            "shipping_amount": 5,
            "shipping_description": "Flat Rate - Fixed",
            "shipping_discount_amount": 0,
            "shipping_discount_tax_compensation_amount": 0,
            "shipping_incl_tax": 5,
            "shipping_tax_amount": 0,
            "state": "processing",
            "status": "processing",
            "store_currency_code": "USD",
            "store_id": 1,
            "store_name": "Main Website\nMain Website Store\nDefault Store View",
            "store_to_order_rate": 0,
            "subtotal": 505.75,
            "subtotal_incl_tax": 505.75,
            "tax_amount": 0,
            "total_item_count": 1,
            "total_qty_ordered": 1,
            "updated_at": "2023-08-16 08:40:19",
            "weight": 0
          },
          "_metadata": {
            "commerceEdition": "Adobe Commerce",
            "commerceVersion": "2.4.5-p3",
            "eventsClientVersion": "1.2.1",
            "storeId": "1",
            "websiteId": "1",
            "storeGroupId": "1"
          },
          "source": "tenanta_7rqtwti_ch6qlx6kkvx3a.tenanta"
        },
        "id": "80579197-e708-47bf-801c-7a82ec7d36c4",
        "source": "urn:uuid:1d02b72b-225f-45a0-a45f-4e89e1b3f300",
        "specversion": "1.0",
        "type": "com.adobe.commerce.observer.sales_order_save_commit_after",
        "datacontenttype": "application/json",
        "time": "2023-08-16T08:40:32.811Z",
        "event_id": "bdc6d818-d6d8-4e80-b78f-d8c47890ff40",
        "recipient_client_id": "e142407e73ef48f884aeb8e925c1e256"
      }

- ## Response: 
   { "data":
      { "DocumentType": "0001",
         "EnterpriseCode": "TenantA",
         "HoldFlag": "Y",
         "OrderHeaderKey":"202308160845212122981",
         "OrderNo": "313",
         "SellerOrganizationCode": "TenantA", 
         "Status": "Created" 
      }, 
      "status": "SUCCESS"
   }


- ## OMS API : 
*Create Order API*
EndPoint : POST /executeFlow/OMSAABCreateOrder 
Service Name : OMSAABCreateOrder 
