import React, { Component } from "react";
import DeliveryLabel from "./deliveryLabel";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";

// import styled from "styled-components";

export default class DeliveryTime extends Component {
  constructor(props) {
    super(props);
    this.state = {
      componentActive: false,
    };
  }

  render() {
    const { componentActive } = this.state;
    const {
      country,
      zipCode,
      itemId,
      requiredQty,
      webhookAccessToken,
      webhookURL,
      ibmOrganizationId,
      buttonColor,
    } = this.props;
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
        <div
          style={{
            float: "left",
          }}
        >
          <Button
            variant="link"
            // style={{ backgroundColor: buttonColor }}
            onClick={() => this.setState({ componentActive: true })}
          >
            Get Delivery Date
          </Button>
        </div>
        {componentActive && (
          <div
            style={{
              float: "left",
              width: "70%",
              padding: "10px",
            }}
          >
            <DeliveryLabel
              webhookURL={webhookURL}
              ibmOrganizationId={ibmOrganizationId}
              itemId={itemId}
              country={country}
              zipCode={zipCode}
              requiredQty={requiredQty}
              webhookAccessToken={webhookAccessToken}
            />
          </div>
        )}
      </div>
    );
  }
}
