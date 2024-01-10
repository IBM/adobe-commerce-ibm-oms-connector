const { Core, Events, State } = require("@adobe/aio-sdk");
const { context, getToken } = require("@adobe/aio-lib-ims");
const { errorResponse, stringParameters } = require("../utils");
const { getOAuthToken } = require("../../auth/AppBuilderAuth");
const { publishEventGeneric } = require("../AppBuilderEvent");
const ACCreditMemo = require("../ACCreditMemo/index");
const ACReturnOrder = require("../ACReturnOrder/index");
const { AC_EVENTS } = require("../../config/constant");

async function fetchEvents(params, token, since, logger) {
  const eventsClient = await Events.init(
    params.AIO_EVENTS_ORG_ID,
    params.AIO_EVENTS_API_KEY,
    token,
  );

  // let options = { limit: 1 };
  // if (since !== undefined) {
  //   options.since = since;
  // } else {
  //   journaling = await eventsClient.getEventsFromJournal(
  //     params.JOURNALLING_URL,
  //   );
  //   await logger.info("journaling" + JSON.stringify(journaling));
  //   return journaling.events;
  // }
  // journaling = await eventsClient.getEventsFromJournal(
  //   params.JOURNALLING_URL + "?since=" + since,
  // );
  // await logger.info("journaling" + JSON.stringify(journaling));
  // return journaling.events;

  let options = { limit: params.max_events_in_batch };
  if (since !== undefined) {
    options.since = since;
  }
  journaling = await eventsClient.getEventsFromJournal(
    params.JOURNALLING_URL,
    options,
  );
  await logger.info("journaling" + JSON.stringify(journaling));
  return journaling.events;
}

async function saveToDb(new_event) {
  const stateClient = await State.init();
  await stateClient.put("SAVETODB", { latest: new_event }, { ttl: -1 });
}

async function getLatestEventPosition(params) {
  const stateClient = await State.init();
  const events = await stateClient.get("SAVETODB");
  if (events === undefined) {
    return undefined;
  } else {
    return events.value.latest.position;
  }
}

function wait(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });

  try {
    // 'info' is the default level if not set
    logger.info("Calling the main action");

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params));

    const config = {
      client_id: params.APPBUILDER_CLIENT_ID,
      client_secret: params.APPBUILDER_CLIENT_SECRET,
      technical_account_email: params.technical_account_email,
      technical_account_id: params.technical_account_id,
      ims_org_id: params.AIO_EVENTS_ORG_ID,
      //@ToDo refactor to pass as env
      scopes: [
        "adobeio_api",
        "openid",
        "read_client_secret",
        "AdobeID",
        "read_organizations",
        "additional_info.roles",
        "manage_client_secrets",
        "additional_info.projectedProductContext",
        "event_receiver_api",
      ],
    };
    await context.set(params.AIO_EVENTS_ORDER_JOURNALLING_EVENT_CODE, config);
    await context.setCurrent(params.AIO_EVENTS_ORDER_JOURNALLING_EVENT_CODE);

    const token = await getOAuthToken(params);
    logger.debug("Token successfully retrieved");

    var latestEventPos = await getLatestEventPosition(params);
    if (latestEventPos === undefined) {
      logger.info("Fetch Event since first position");
    } else {
      logger.info(`Fetch Event since position: ${latestEventPos}`);
    }

    var fetch_cnt = 0;
    var total_event_num = 0;
    var events = await fetchEvents(params, token, latestEventPos, logger);

    if (!events) {
      logger.info(
        "Got 0 events, skipping further processing" + JSON.stringify(events),
      );
      return { event_fetched: total_event_num };
    }

    logger.info(
      `Got ${events.length} events, saved them to DB, last event position is: ${
        events[events.length - 1].position
      }`,
    );
    let creditMemoResults = [];
    for (const event of events) {
      logger.debug(
        `Processing event with id ${JSON.stringify(event)} at position ${
          event.position
        }`,
      );
      await saveToDb(event);
      let result = null;
      if (event.event.data.type == AC_EVENTS.CREDIT_MEMO) {
        result = await CreditMemoCode(event.event.data.params, logger);
        creditMemoResults.push(result);
      } else if (event.event.data.type == AC_EVENTS.RETURN) {
        result = await ACReturnOrderCode(event.event.data.params, logger);
        creditMemoResults.push(result);
      }
      logger.debug(`Credit Memo Result 1: ${JSON.stringify(result)}`);
    }

    return {
      event_fetched: total_event_num,
      CreditMemoResult: creditMemoResults,
    };
  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, "server error", logger);
  }
}

async function CreditMemoCode(params, logger) {
  await logger.info("CreditMemoCode: " + JSON.stringify(params));
  const result = await ACCreditMemo.main(params);
  await logger.info("CreditMemoCode result: " + JSON.stringify(result));

  // await wait(100000);
  // message = _message;
  // const eventResponse = await publishEventGeneric(
  //   params,
  //   logger,
  //   {
  //     message: message,
  //   },
  //   token,
  //   "fc0fe00a-35cd-4ec0-80a1-4f97ff7d02fa",
  //   "ibm.sterling.oms.test_event.v0",
  // );
}

async function ACReturnOrderCode(params, logger) {
  await logger.info("ACReturnOrderCode: " + JSON.stringify(params));
  const result = await ACReturnOrder.main(params);
  await logger.info("ACReturnOrderCode result: " + JSON.stringify(result));
}

exports.main = main;
