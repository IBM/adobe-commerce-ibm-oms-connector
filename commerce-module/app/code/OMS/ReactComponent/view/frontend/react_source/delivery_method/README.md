# React Components to be integrated in Adobe commerce

Description: Two Headless React Components created for Source Locations and InStore Pickup Locations. Source Locations display all the nodes which are the distributed Centers which InStore pickup locations displays all the store listed.

## These are the modal popup component. The props required for these component are as follows. 


    <SourceLocations 
        adobeAPIURL = 'https://tenanta-jcobgxq-ch6qlx6kkvx3a.us-4.magentosite.cloud/rest/V1/inventory/sources'
        webhookURL = 'https://48941-sterlingomsapp-tenanta.adobeio-static.net/api/v1/web/oms-commerce-appbuilder/StockDetailOMS'
        adobeAccessToken  = ''
        webhookAccessToken = ''
        closeModal={this.closeModal}
        confirmSelectedSource={this.confirmSelectedSource}
        itemId='3941'
        lineId='1'
        organizationId='91D55B255640B3AE7F000101@AdobeOrg'
    />

    <InStoreLocations
        adobeAPIURL = 'https://tenanta-jcobgxq-ch6qlx6kkvx3a.us-4.magentosite.cloud/rest/V1/inventory/sources'
        webhookURL = 'https://48941-sterlingomsapp-tenanta.adobeio-static.net/api/v1/web/oms-commerce-appbuilder/StockDetailOMS'
        adobeAccessToken  = ''
        webhookAccessToken = ''
        closeModal={this.closeModal}
        confirmSelectedPickup={this.confirmSelectedPickup}
        itemId='3941'
        lineId='1'
        organizationId='91D55B255640B3AE7F000101@AdobeOrg'
    />

    closeModal and confirmSelectedSource are the components added to close the modal component and display the selected source respectively. This will be the functions for the Parent Component in which these components are added.

## adobeAccessToken

- adobeAccessToken will be received when user is authenticated using oauth. This will be available on the page in adobe commerce where this component will be used


## webhookAccessToken

- This is token that we get from adobe developer console from OAuth Server-to-Server option and in that there is generate access token option which return the token required to use webhookncreated which in turns call OMS API.

## adobeAPIURL

- This is the merchant host URL for adobe which will be used to fetch the adobe source API.

## webhookURL

- This is the appbuilder wehbook URL for specific Tenant/Merchant. This webhook calls the API for OMS to fetch the latest stock details.

## organizationId

- This is the organization ID. This is available in .aio file or on developer console. It is required along with webhook access token when adobe-require-auth is set to true for webhook.

## itemId & lineId

- itemId and lineId are the details which will be fetched from item which is selected for that particular order.

