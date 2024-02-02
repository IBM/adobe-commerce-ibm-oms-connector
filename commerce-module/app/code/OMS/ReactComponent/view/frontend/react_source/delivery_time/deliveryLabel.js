import React, { Component } from "react";
import { Spinner } from "react-bootstrap";

// import styled from "styled-components";

export default class DeliveryLabel extends Component {
  constructor(props) {
    super(props);
    console.log("props in delivery", props);
    this.state = {
      date1: "",
      loading: true,
      spinner: false,
      isFailed: false,
    };
  }

  checkDeliveryTime = (date1) => {
    let datetemp = date1.split("T");
    this.setState({
      date1: datetemp[0],
      loading: false,
      spinner: false,
      isFailed: false,
    });
  };

  async componentDidMount() {
    const {
      country,
      zipCode,
      itemId,
      requiredQty,
      webhookAccessToken,
      webhookURL,
      ibmOrganizationId,
    } = this.props;
    console.log(webhookAccessToken);
    this.setState({ spinner: true });
    const data = {
      ShipToAddress: {
        Country: country,
        ZipCode: zipCode,
      },
      ItemID: itemId,
      RequiredQty: requiredQty,
    };
    const url = webhookURL + "deliveryTimeWebhook";
    const request = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + webhookAccessToken,
        "Content-Type": "application/json",
        "x-gw-ims-org-id": ibmOrganizationId,
      },
      body: JSON.stringify(data),
    });
    const result = await request.json();

    if (result.SuggestedOption.Option) {
      let deliveryDate =
        result.SuggestedOption.Option.Interactions.Interaction[0].DeliveryDate;
      this.checkDeliveryTime(deliveryDate);
    } else if (result.SuggestedOptionUnavailableLines) {
      this.setState({ loading: false, spinner: false, isFailed: true });
    } else {
      this.setState({ loading: false, spinner: false, isFailed: true });
    }
  }

  render() {
    console.log("statte", this.state);
    const styles = {
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
      },
    };
    return (
      <div>
        {this.state.isFailed ? (
          <h9 style={{ textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: "bold", color: "red" }}>
              Could't find product or problem getting delivery date.
            </div>
          </h9>
        ) : (
          <h6 style={{ textAlign: "left" }}>
            {!this.state.loading && (
              <div style={styles.textStyle}>
                Order now to get it by {this.state.date1}.
              </div>
            )}
            {this.state.spinner && <Spinner animation="border" />}
          </h6>
        )}
      </div>
    );
  }
}
