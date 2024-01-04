import logo from "./logo.svg";
import "./App.css";
import DeliveryTime from "./ui-components/delivery_time/index";
import LocationStockStatus from "./ui-components/location_stock_availability/index";
import DeliveryMethod from "./ui-components/delivery_method/index";

import styled from "styled-components";
import "bootstrap/dist/css/bootstrap.css";

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}

      <div>
        <div>
          <DeliveryTime
            buttonColor="#1a79c2"
            webhookURL="https://48941-sterlingomsapp-tenantc.adobeio-static.net/api/v1/web/oms-commerce-appbuilder/deliveryTimeWebhook"
            ibmOrganizationId="91D55B255640B3AE7F000101@AdobeOrg"
            itemId="3953"
            country="IN"
            zipCode="380005"
            requiredQty="1"
            webhookAccessToken=""
          ></DeliveryTime>
        </div>
        <div>
          <LocationStockStatus
            // buttonColor="#1a79c2"
            isSourceButtonShow={true}
            isInstoreButtonShow={false}
            webhookURL="https://48941-sterlingomsapp-tenantc.adobeio-static.net/api/v1/web/oms-commerce-appbuilder/"
            webhookAccessToken=""
            itemId="3970"
            lineId="1"
            organizationId="91D55B255640B3AE7F000101@AdobeOrg"
          ></LocationStockStatus>
        </div>
        <div>
          <DeliveryMethod
            webhookURL="https://48941-sterlingomsapp-tenantc.adobeio-static.net/api/v1/web/oms-commerce-appbuilder/"
            webhookAccessToken=""
            itemId="3970"
            lineId="1"
            organizationId="91D55B255640B3AE7F000101@AdobeOrg"
          />
        </div>
       
      </div>
    </div>
  );
}

export default App;
