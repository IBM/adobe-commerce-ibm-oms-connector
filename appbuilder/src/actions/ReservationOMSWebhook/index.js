/*
 * <license header>
 */

/**
 * This is a sample action showcasing how to access an external API
 *
 * Note:
 * You might want to disable authentication and authorization checks against Adobe Identity Management System for a generic action. In that case:
 *   - Remove the require-adobe-auth annotation for this action in the manifest.yml of your application
 *   - Remove the Authorization header from the array passed in checkMissingRequestInputs
 *   - The two steps above imply that every client knowing the URL to this deployed action will be able to invoke it without any authentication and authorization checks against Adobe Identity Management System
 *   - Make sure to validate these changes against your security requirements before deploying the action
 */

const fetch = require("node-fetch");
const { Core } = require("@adobe/aio-sdk");
const {
  errorResponse,
  getBearerToken,
  stringParameters,
  checkMissingRequestInputs,
} = require("../utils");
const { getOAuthToken } = require("../../auth/AppBuilderAuth");
const { publishEvent, publishEventGeneric } = require("../AppBuilderEvent");
const { reserveAvailableInventory } = require("../../services/OMSService");
const { createReserveInventoryPayloadHook } = require("../../models/order");
const { getUserDetails } = require("../../auth/OMSAuthentication");

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });

  try {
    // 'info' is the default level if not set
    logger.info("Calling the main action");

    logger.info("Calling the main action", JSON.stringify(params));
    logger.debug(stringParameters(params));

    const reservationPayload = await createReserveInventoryPayloadHook(
      params.data,
      params.RESERVATION_EXPIRE_MINUTES,
    );
    const adminDetails = await getUserDetails(params, true);

    const reservation = await reserveAvailableInventory(
      params,
      adminDetails,
      reservationPayload,
    );

    logger.debug(
      "createReserveInventoryPayloadHook: " + JSON.stringify(reservation),
    );
    logger.debug("reservation: " + JSON.stringify(reservation));
    let isError = false;
    let errorMessage = "Reservation Id not created";
    if (
      reservation != null &&
      reservation.reserveAvailableInventory &&
      reservation.reserveAvailableInventory.errors &&
      reservation.reserveAvailableInventory.errors.length > 0
    ) {
      isError = true;
      errorMessage =
        "Reservation Id not created :" +
        reservation.reservationId +
        " | " +
        reservation.reserveAvailableInventory.errors[0].ErrorDescription;
    } else {
      errorMessage = "Reservation Id not created :" + reservation.reservationId;
    }

    if (reservation == null || isError) {
      const response = {
        statusCode: 200,
        body: {
          Success: false,
          Message: errorMessage,
          ReservationResponse: JSON.stringify(reservation),
        },
      };
      return response;
    }
    const response = {
      statusCode: 200,
      body: {
        ReservationId: reservation.reservationId,
        Success: true,
        Message: "Reservation Id generated successfully",
        ReservationResponse: JSON.stringify(reservation),
      },
    };
    return response;
  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, "server error", logger);
  }
}

exports.main = main;
