import React, { Component } from "react";
import {
  Button,
  Modal,
  ListGroup,
  InputGroup,
  Form,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import styled from "styled-components";
import "./index.css";
import InStoreLocations from "./InStoreLocations";

export default class DeliveryMethod extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deliveryList: [
        {
          id: 1,
          name: "Home Delivery",
          subTitle: "Ships within 2 business days.",
        },
        {
          id: 2,
          name: "Store Pickup",
          subTitle: "Get it today for free!",
        },
      ],
      inStoreComponent: false,
      selectedDeliveryMethod: -1,
      selectedPickup: null,
    };
  }
  closeModal = () => {
    this.setState({
      inStoreComponent: false,
    });
  };
  confirmSelectedPickup = (item) => {
    this.setState({
      inStoreComponent: false,
    });
  };

  componentDidMount() {
    //TODO: Below code is removed , but we can use this for future if we wanted to have default value selected on page load
    // const storedValue = window.localStorage.getItem("DELIVERY_METHOD");
    // document.cookie = "reactDeliveryMethod=" + storedValue;
    // const selectedStoreItem = window.localStorage.getItem("SELECTED_STORE");
    // if (storedValue) {
    //   this.setState({ selectedDeliveryMethod: storedValue });
    // }
    // if (selectedStoreItem) {
    //   const store = JSON.parse(selectedStoreItem);
    //   this.setState({ selectedPickup: store });
    //   document.cookie = "reactSelectedStore=" + store.source_code;
    // }
    console.log("componentDidMount");
    this.setCookie("reactSelectedStore", "", 0);
    this.setCookie("reactDeliveryMethod", "", 0);
    window.localStorage.removeItem("SELECTED_STORE");
    window.localStorage.removeItem("DELIVERY_METHOD");
  }

  setCookie = (name, val) => {
    var d = new Date();
    d.setTime(d.getTime() + 0 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + val + ";" + expires + ";path=/";
  };

  closeModal = () => {
    this.setState({
      inStoreComponent: false,
    });
  };

  confirmSelectedPickup = (item) => {
    this.setState({
      selectedPickup: item,
      inStoreComponent: false,
    });
    window.localStorage.setItem("SELECTED_STORE", JSON.stringify(item));
    document.cookie = "reactSelectedStore=" + item.source_code;
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
          border: 1,
          borderWidth: 1,
          borderColor: "gray",
          borderStyle: "solid",
          width: "100%",
        }}
      >
        <div style={{}}>
          <h5 style={{ marginLeft: 10, marginTop: 10 }}>{"Delivery Method"}</h5>
          <div style={{ marginLeft: 10 }}>
            <ListGroup
              items={this.state.deliveryList}
              selectionMode="single"
              maxWidth="size-6000"
              aria-label="Dynamic ListView items example"
              onSelectionChange={this.setSelectedSource}
            >
              {this.state.deliveryList.map((item) => {
                return (
                  <ListGroup.Item key={item.name}>
                    <div class="row">
                      <div
                        class="column1"
                        style={{
                          backgroundColor: "transparent",
                        }}
                      >
                        <input
                          onChange={() => {
                            this.setState({
                              selectedDeliveryMethod: item.id,
                              selectedPickup: null,
                            });
                            window.localStorage.removeItem("SELECTED_STORE");
                            window.localStorage.setItem(
                              "DELIVERY_METHOD",
                              item.id,
                            );
                            document.cookie = "reactDeliveryMethod=" + item.id;
                          }}
                          type="radio"
                          id={item.id}
                          name="storeSelection"
                          checked={
                            this.state.selectedDeliveryMethod == item.id ||
                            selectedPickup
                              ? "checked"
                              : ""
                          }
                        />
                        {/* <h2>{item.name}</h2>
                        <p>{item.subTitle}</p> */}
                      </div>
                      <div
                        class="column2"
                        style={{ backgroundColor: "transparent" }}
                      >
                        <h5>{item.name}</h5>
                        <p>{item.subTitle}</p>
                        {item.id == 2 ? (
                          <div>
                            <Button
                              variant="link"
                              style={{
                                marginTop: -20,
                                marginLeft: -10,
                                float: "left",
                                padding: "10px",
                              }}
                              onClick={() =>
                                this.setState({ inStoreComponent: true })
                              }
                            >
                              {selectedPickup
                                ? "Change Store"
                                : "Select your store"}
                            </Button>
                            <div
                              style={{
                                marginTop: -20,
                                marginLeft: -10,
                                float: "left",
                                width: "20%",
                                padding: "10px",
                              }}
                            >
                              <p style={{ fontWeight: "bolder" }}>
                                {selectedPickup
                                  ? " | " + selectedPickup.source_code
                                  : ""}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div />
                        )}
                      </div>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </div>
        </div>
        {inStoreComponent && (
          <InStoreLocations
            webhookURL={webhookURL}
            webhookAccessToken={webhookAccessToken}
            closeModal={this.closeModal}
            confirmSelectedPickup={this.confirmSelectedPickup}
            itemId={itemId}
            lineId={lineId}
            organizationId={organizationId}
          />
        )}
      </div>
    );
  }
}
