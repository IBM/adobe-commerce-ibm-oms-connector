# React Components to be integrated in Adobe commerce

Description: One Headless React Component is created for showing Promise delivery date in label. This promise delivery date will be get by findInventory api.This is the date by which the shipped order will be delivered.

## These are the modal popup component. The props required for these component are as follows. 


<DeliveryLabel
                    adobeAPIURL = 'http://localhost:8080/https://tenanta-jcobgxq-ch6qlx6kkvx3a.us-4.magentosite.cloud/rest/V1/inventory/sources'
                    itemId='3941'
                    country= 'US'
                    zipCode= '411021'
                    requiredQty= '1'
                    webhookAccessToken=''
                    organizationId='91D55B255640B3AE7F000101@AdobeOrg'
                 />

## webhookAccessToken

- This is token that we get from adobe developer console from OAuth Server-to-Server option and in that there is generate access token option which return the token required to use webhookncreated which in turns call OMS API.

## adobeAPIURL

- This is the merchant host URL for adobe which will be used to fetch the adobe source API.


## organizationId

- This is the organization ID. This is available in .aio file or on developer console. It is required along with webhook access token when adobe-require-auth is set to true for webhook.

