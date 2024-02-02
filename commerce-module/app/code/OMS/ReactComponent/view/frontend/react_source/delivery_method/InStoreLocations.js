import React, { Component } from "react";
import styled from "styled-components";
import {
  Modal,
  Button,
  ListGroup,
  InputGroup,
  Form,
  Container,
  Row,
  Col,
} from "react-bootstrap";

export default class InStoreLocations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      hasError: false,
      error: "",
      loading: true,
      selectedStore: "",
    };
  }
  getSourceLocations = async (searchKey) => {
    const { webhookAccessToken, webhookURL } = this.props;
    this.setState({
      loading: true,
    });
    const data = {
      data: { searchKey: searchKey },
    };
    if (searchKey) {
    }
    const request = await fetch(webhookURL + "ACSourceWebhook", {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: "Bearer " + webhookAccessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await request.json();
    console.log("ACSourceWebhook", result);

    if (request.status !== 200) {
      this.setState({
        items: [],
        hasError: true,
        error: JSON.stringify(result),
        loading: false,
      });
    } else {
      const nodes = [];
      const updatedItems = [];
      result.items.forEach((element) => {
        if (
          element.extension_attributes.is_pickup_location_active &&
          element.source_code !== "ISPU01"
        ) {
          nodes.push(element.source_code);
          updatedItems.push(element);
        }
      });
      await this.getStockDetails(nodes, updatedItems);
    }
  };

  getStockDetails = async (nodes, items) => {
    const { itemId, lineId, webhookAccessToken, webhookURL, organizationId } =
      this.props;
    const data = {
      // data: { itemId, lineId, nodes },
      data: { items: [{ itemId, lineId }] },
    };
    const request = await fetch(webhookURL + "StockDetailOMS", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + webhookAccessToken,
        "Content-Type": "application/json",
        "x-gw-ims-org-id": organizationId,
      },
      body: JSON.stringify(data),
    });
    const result = await request.json();
    console.log(result);
    if (request.status !== 200) {
      this.setState({
        items: [],
        hasError: true,
        error: JSON.stringify(result),
        loading: false,
      });
    } else {
      let selectedStore = null;
      const updatedItems = [];
      let shipNodeInventory =
        result.PromiseLines.PromiseLine[0].Availability.AvailableInventory
          .ShipNodeAvailableInventory;
      if (shipNodeInventory.Inventory) {
        if (shipNodeInventory.Inventory.length > 0) {
          shipNodeInventory.Inventory.forEach((element) => {
            let previousStatus = items.filter((item) => {
              if (item.source_code == element.Node) {
                return true;
              }
            });
            if (
              previousStatus.length > 0 &&
              previousStatus[0].source_code === element.Node
            ) {
              selectedStore = element;
              if (selectedStore != null) {
                previousStatus[0]["availableQuantity"] =
                  selectedStore.AvailableOnhandQuantity;
              } else {
                previousStatus[0]["availableQuantity"] = 0;
              }
              updatedItems.push(previousStatus[0]);
            }
            console.log("previousStatus 1:", JSON.stringify(previousStatus));
          });
        } else {
          let previousStatus = items.filter((item) => {
            if (item.source_code == shipNodeInventory.Inventory.Node) {
              return true;
            }
          });
          if (
            previousStatus.length > 0 &&
            previousStatus[0].source_code === shipNodeInventory.Inventory.Node
          ) {
            selectedStore = shipNodeInventory.Inventory;
            if (selectedStore != null) {
              previousStatus[0]["availableQuantity"] =
                selectedStore.AvailableOnhandQuantity;
            } else {
              previousStatus[0]["availableQuantity"] = 0;
            }
            updatedItems.push(previousStatus[0]);
          }
        }
      }

      this.setState({
        items: updatedItems,
        hasError: false,
        error: "",
        loading: false,
      });
    }
  };

  async componentDidMount() {
    await this.getSourceLocations();
  }

  searchByPostCode = async (e) => {
    if (e.target.value.length > 3) {
      await this.getSourceLocations(e.target.value);
    } else if (e.target.value.length == 0) {
      await this.getSourceLocations(e.target.value);
    }
  };

  getStatus = (qty) => {
    if (qty === 0) {
      return "No Stock";
    } else if (qty < 5) {
      return "Low Stock";
    }
    return "High Stock";
  };
  getStatusColor = (qty) => {
    if (qty === 0) {
      return "red";
    } else if (qty < 5) {
      return "orange";
    }
    return "green";
  };
  setSelectedSource = (e) => {
    this.setState({
      selectedStore: e.target.id,
    });
  };

  confirmSource = () => {
    let selectedStore = this.state.items.filter(
      (item) => item.source_code === this.state.selectedStore,
    );
    this.props.confirmSelectedPickup(selectedStore[0]);
  };

  render() {
    const { items, loading, selectedStore } = this.state;
    return (
      <div
        className="modal show"
        style={{ display: "block", position: "initial" }}
      >
        <Modal size="lg" show={true} onHide={this.props.closeModal}>
          <Modal.Header>
            <Container>
              <Row>
                <Col md={5}>
                  {" "}
                  <Modal.Title>InStore Pickup Location</Modal.Title>{" "}
                </Col>
                <Col />
                <Col>
                  <InputGroup className="mb-3">
                    <Form.Control
                      placeholder="Search by Postal Code"
                      aria-label="search"
                      onChange={this.searchByPostCode}
                    />
                  </InputGroup>
                </Col>
              </Row>
            </Container>
          </Modal.Header>
          <Modal.Body>
            {loading ? (
              <h6> Loading </h6>
            ) : items.length ? (
              <ListGroup
                items={items}
                selectionMode="single"
                maxWidth="size-6000"
                height="250px"
                aria-label="Dynamic ListView items example"
                onSelectionChange={this.setSelectedSource}
              >
                {items.map((item) => {
                  let displayAddress = `${item.street ? item.street : ""} 
                                        ${item.city ? item.city : ""} ${
                    item.region ? item.region : ""
                  }
                                        ${
                                          item.country_id ? item.country_id : ""
                                        } ${
                    item.postcode ? item.postcode : ""
                  }`;

                  return (
                    <ListGroup.Item key={item.name}>
                      <Form.Check
                        inline
                        name="groupOptions"
                        type="radio"
                        id={item.source_code}
                        style={{ position: "absolute" }}
                        onChange={this.setSelectedSource}
                      />
                      <div style={{ position: "relative", marginLeft: "25px" }}>
                        <h5>{item.name}</h5>
                        <StockWrapper>
                          <div
                            className="stock-label"
                            style={{
                              color: this.getStatusColor(
                                parseInt(item.availableQuantity),
                              ),
                            }}
                          >
                            {this.getStatus(parseInt(item.availableQuantity))}
                          </div>
                        </StockWrapper>
                      </div>
                      <p slot="description">{displayAddress} </p>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            ) : (
              <h6> No Source Location Available </h6>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.props.closeModal}>
              Close
            </Button>
            {items.length > 0 && selectedStore && (
              <Button variant="primary" onClick={this.confirmSource}>
                Confirm
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const StockWrapper = styled.div`
  .stock-label {
    position: absolute;
    right: 20px;
    fontweight: bolder;
  }
`;
