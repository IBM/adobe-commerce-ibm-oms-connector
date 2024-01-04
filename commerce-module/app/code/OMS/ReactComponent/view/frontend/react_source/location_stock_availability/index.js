import React, { Component } from "react";
import SourceLocations from "./SourceLocations";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";

export default class LocationStockStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceComponent: false,
      inStoreComponent: false,
      selectedSource: {},
      selectedPickup: {},
    };
  }

  closeModal = () => {
    this.setState({
      sourceComponent: false,
      inStoreComponent: false,
    });
  };

  confirmSelectedSource = (item) => {
    console.log();
    this.setState({
      selectedSource: item,
      sourceComponent: false,
    });
  };

  confirmSelectedPickup = (item) => {
    this.setState({
      selectedPickup: item,
      inStoreComponent: false,
    });
  };

  displayAddress = (item) => {
    let displayAdd = `${item.street ? item.street : ""} 
            ${item.city ? item.city : ""} ${item.region ? item.region : ""}
            ${item.country_id ? item.country_id : ""} ${
      item.postcode ? item.postcode : ""
    }`;
    return displayAdd;
  };

  render() {
    const {
      isSourceButtonShow,
      isInstoreButtonShow,
      buttonColor,
      adobeAPIURL,
      webhookURL,
      adobeAccessToken,
      webhookAccessToken,
      itemId,
      lineId,
      organizationId,
    } = this.props;
    const {
      sourceComponent,
      inStoreComponent,
      selectedSource,
      selectedPickup,
    } = this.state;
    console.log("this.state", this.state);
    return (
      <div
        style={{
          content: "",
          display: "table",
          clear: "both",
          border: 0,
          borderWidth: 0,
          borderColor: "gray",
          borderStyle: "solid",
          width: "100%",
        }}
      >
        {isSourceButtonShow == true && (
          <div
            style={{
              float: "left",
            }}
          >
            <Button
              variant="link"
              // style={{ backgroundColor: buttonColor }}
              type="button"
              class="btn btn-primary"
              data-toggle="modal"
              data-target="#exampleModal"
              onClick={() => this.setState({ sourceComponent: true })}
            >
              View Source Location Inventory Status
            </Button>
            {selectedSource.source_code && (
              <div
                style={{
                  borderStyle: "solid",
                  width: "fit-content",
                  float: "right",
                  padding: "20px",
                }}
              >
                <h5>{selectedSource.source_code}</h5>
                <h6> {this.displayAddress(selectedSource)}</h6>
              </div>
            )}
          </div>
        )}

        {isInstoreButtonShow == true && (
          <div
            style={{
              float: "left",
              width: "15%",
              padding: "10px",
            }}
          >
            <Button
              style={{ backgroundColor: buttonColor }}
              onClick={() => this.setState({ inStoreComponent: true })}
            >
              Select In Store Pickup
            </Button>
            {selectedPickup.source_code && (
              <div
                style={{
                  borderStyle: "solid",
                  width: "fit-content",
                  float: "right",
                  padding: "20px",
                }}
              >
                <h5>{selectedPickup.source_code}</h5>
                <h6> {this.displayAddress(selectedPickup)}</h6>
              </div>
            )}
          </div>
        )}

        {sourceComponent && (
          <SourceLocations
            adobeAPIURL={adobeAPIURL}
            webhookURL={webhookURL}
            adobeAccessToken={adobeAccessToken}
            webhookAccessToken={webhookAccessToken}
            closeModal={this.closeModal}
            confirmSelectedSource={this.confirmSelectedSource}
            itemId={itemId}
            lineId={lineId}
            organizationId={organizationId}
          />
        )}
      </div>
    );
  }
}
