const { Events } = require("@adobe/aio-sdk");

const { CloudEvent } = require("cloudevents");
const uuid = require("uuid");

async function publishEvent(params, logger, payload, appBuilderToken) {
  // initialize the client
  const eventsClient = await Events.init(
    params.AIO_EVENTS_ORG_ID,
    params.AIO_EVENTS_API_KEY,
    appBuilderToken,
  );

  await logger.info(
    "publishEvent" +
      params.AIO_EVENTS_ORG_ID +
      params.AIO_EVENTS_API_KEY +
      appBuilderToken,
  );

  const cloudEvent = createCloudEvent(
    params.AIO_EVENTS_CUSTOM_PROVIDER_ID,
    params.AIO_EVENTS_ORDER_HOLD_EVENT_CODE,
    payload,
  );

  await logger.info("publishEvent.cloudEvent", cloudEvent);
  // Publish to I/O Events
  const published = await eventsClient.publishEvent(cloudEvent);
  await logger.info("publishEvent.published", published);
  let statusCode = 200;
  if (published === "OK") {
    logger.info("Published successfully to I/O Events");
  } else if (published === undefined) {
    logger.info(
      "Published to I/O Events but there were not interested registrations",
    );
    statusCode = 204;
  }
  return {
    publish_event: published,
    statusCode: statusCode,
  };
}

function createCloudEvent(providerId, eventCode, payload) {
  let cloudevent = new CloudEvent({
    source: "urn:uuid:" + providerId,
    type: eventCode,
    datacontenttype: "application/json",
    data: payload,
    id: uuid.v4(),
  });
  return cloudevent;
}

async function publishTestEvent(
  params,
  logger,
  payload,
  appBuilderToken,
  providerId,
  eventCode,
) {
  // initialize the client
  const eventsClient = await Events.init(
    params.AIO_EVENTS_ORG_ID,
    params.AIO_EVENTS_API_KEY,
    appBuilderToken,
  );

  await logger.info(
    "publishEvent" +
      params.AIO_EVENTS_ORG_ID +
      params.AIO_EVENTS_API_KEY +
      appBuilderToken,
  );

  const cloudEvent = createCloudEvent(providerId, eventCode, payload);

  await logger.info("publishEvent.cloudEvent", cloudEvent);
  // Publish to I/O Events
  const published = await eventsClient.publishEvent(cloudEvent);
  await logger.info("publishEvent.published", published);
  let statusCode = 200;
  if (published === "OK") {
    logger.info("Published successfully to I/O Events");
  } else if (published === undefined) {
    logger.info(
      "Published to I/O Events but there were not interested registrations",
    );
    statusCode = 204;
  }
  return {
    publish_event: published,
    statusCode: statusCode,
  };
}

async function publishEventGeneric(
  params,
  logger,
  payload,
  appBuilderToken,
  providerId,
  eventCode,
) {
  // initialize the client
  const eventsClient = await Events.init(
    params.AIO_EVENTS_ORG_ID,
    params.AIO_EVENTS_API_KEY,
    appBuilderToken,
  );

  await logger.info(
    "publishEvent" +
      params.AIO_EVENTS_ORG_ID +
      params.AIO_EVENTS_API_KEY +
      appBuilderToken,
  );

  const cloudEvent = createCloudEvent(providerId, eventCode, payload);

  await logger.info("publishEvent.cloudEvent", cloudEvent);
  // Publish to I/O Events
  const published = await eventsClient.publishEvent(cloudEvent);
  await logger.info("publishEvent.published", published);
  let statusCode = 200;
  if (published === "OK") {
    logger.info("Published successfully to I/O Events");
  } else if (published === undefined) {
    logger.info(
      "Published to I/O Events but there were not interested registrations",
    );
    statusCode = 204;
  }
  return {
    publish_event: published,
    statusCode: statusCode,
  };
}
module.exports = {
  publishEvent,
  publishTestEvent,
  publishEventGeneric,
};
