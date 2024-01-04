import React from "react";
import { Heading, View, Content, Link, Flex } from "@adobe/react-spectrum";
import DeliveryTime from "../../../react-componenet/src/ui-components/delivery_time/index";
import LocationStockStatus from "../../../react-componenet/src/ui-components/location_stock_availability/index";
import TextAlignRight from "@spectrum-icons/workflow/TextAlignRight";
import styled from "styled-components";

export const TestingComponents = () => (
  <View width="size-8000">
    <Heading level={1}>
      <StockWrapper>
        <div className="border-highlight">
          Useful documentation for your app{" "}
        </div>
      </StockWrapper>
    </Heading>
    <Content>
      <div>
        <DeliveryTime
          buttonColor="#1a79c2"
          webhookURL="https://48941-sterlingomsapp-tenanta.adobeio-static.net/api/v1/web/oms-commerce-appbuilder/deliveryTimeWebhook"
          ibmOrganizationId=""
          itemId="3941"
          country="US"
          zipCode="411021"
          requiredQty="1"
          webhookAccessToken=""        ></DeliveryTime>
      </div>
      <div>
        <LocationStockStatus
          buttonColor="#1a79c2"
          isSourceButtonShow={false}
          isInstoreButtonShow={true}
          adobeAPIURL="http://localhost:8080/https://tenanta-jcobgxq-ch6qlx6kkvx3a.us-4.magentosite.cloud/rest/V1/inventory/sources"
          webhookURL="http://localhost:8080/https://48941-sterlingomsapp-tenanta.adobeio-static.net/api/v1/web/oms-commerce-appbuilder/StockDetailOMS"
          adobeAccessToken=""
          webhookAccessToken=""
          itemId="3941"
          lineId="1"
          organizationId=""
        ></LocationStockStatus>
      </div>
      <div>
        <LocationStockStatus
          buttonColor="#1a79c2"
          isSourceButtonShow={true}
          isInstoreButtonShow={false}
          adobeAPIURL="http://localhost:8080/https://tenanta-jcobgxq-ch6qlx6kkvx3a.us-4.magentosite.cloud/rest/V1/inventory/sources"
          webhookURL="http://localhost:8080/https://48941-sterlingomsapp-tenanta.adobeio-static.net/api/v1/web/oms-commerce-appbuilder/StockDetailOMS"
        adobeAccessToken=""
          webhookAccessToken=""
              itemId="3941"
          lineId="1"
          organizationId=""
        ></LocationStockStatus>
      </div>
      <div>
      </div>
    </Content>
  </View>
);

const StockWrapper = styled.div`
  .border-highlight {
    text-align: center;
  }
`;
