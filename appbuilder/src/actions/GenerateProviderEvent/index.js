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
const { EVENT_PROVIDER_ACTION_TYPE } = require("../../config/constant");
// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });

  try {
    // 'info' is the default level if not set
    logger.info("Calling the main action");

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params));

    // check for missing request input parameters and headers
    const requiredParams = ["providers"];
    const requiredHeaders = ["Authorization"];
    const errorMessage = checkMissingRequestInputs(
      params,
      requiredParams,
      requiredHeaders,
    );
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger);
    }
    const generateAccessTokenReq = await fetch(
      `${params.OAUTH_BASE_URL}v3?client_id=${params.OAUTH_CLIENT_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `client_secret=${params.OAUTH_CLIENT_SECRET}&grant_type=client_credentials&scope=${params.OAUTH_SCOPES}`,
      },
    );
    const generateAccessTokenResult = await generateAccessTokenReq.json();
    if (!generateAccessTokenResult?.access_token) {
      logger.error(
        `Unable to generate oauth token: ${generateAccessTokenResult.error}`,
      );
      return errorResponse(
        500,
        `Unable to generate oauth token: ${generateAccessTokenResult.error}`,
        logger,
      );
    }

    let providersCreated = [];
    let eventsCreted = null;
    let createCustomEventProviderResult;
    if (params?.providers) {
      for (const provider of params?.providers) {
        if (params.action == EVENT_PROVIDER_ACTION_TYPE.PROVIDER_AND_EVENT) {
          const createCustomEventProviderReq = await fetch(
            `${params.IO_MANAGEMENT_BASE_URL}${params.IO_CONSUMER_ID}/${params.IO_PROJECT_ID}/${params.IO_WORKSPACE_ID}/providers`,
            {
              method: "POST",
              headers: {
                "x-api-key": `${params.OAUTH_CLIENT_ID}`,
                Authorization: `Bearer ${generateAccessTokenResult.access_token}`,
                "content-type": "application/json",
                Accept: "application/hal+json",
              },
              body: JSON.stringify({
                // read here about the use of the spread operator to merge objects: https://dev.to/sagar/three-dots---in-javascript-26ci
                ...(provider?.label ? { label: `${provider?.label}` } : null),
                ...(provider?.description
                  ? { description: `${provider?.description}` }
                  : null),
                ...(provider?.docs_url
                  ? { docs_url: `${provider?.docs_url}` }
                  : null),
              }),
            },
          );
          createCustomEventProviderResult =
            await createCustomEventProviderReq.json();
          if (!createCustomEventProviderResult?.id) {
            logger.error(
              `Unable to create provider: reason = "${createCustomEventProviderResult.reason}", message = "${createCustomEventProviderResult.message}"`,
              logger,
            );
            return errorResponse(
              500,
              `Unable to create provider: reason = "${createCustomEventProviderResult.reason}", message = "${createCustomEventProviderResult.message}"`,
              logger,
            );
          }

          providersCreated.push({
            label: `${provider?.label}`,
            id: `${createCustomEventProviderResult?.id}`,
          });
        } else if (params.action == EVENT_PROVIDER_ACTION_TYPE.EVENT) {
          createCustomEventProviderResult = { id: provider.id };
        }
        if (provider?.events) {
          for (const metadata of provider?.events) {
            const addEventMetadataReq = await fetch(
              `${params.IO_MANAGEMENT_BASE_URL}${params.IO_CONSUMER_ID}/${params.IO_PROJECT_ID}/${params.IO_WORKSPACE_ID}/providers/${createCustomEventProviderResult.id}/eventmetadata`,
              {
                method: "POST",
                headers: {
                  "x-api-key": `${params.OAUTH_CLIENT_ID}`,
                  Authorization: `Bearer ${generateAccessTokenResult.access_token}`,
                  "content-type": "application/json",
                  Accept: "application/hal+json",
                },
                body: JSON.stringify({
                  ...(metadata?.event_code
                    ? { event_code: `${metadata?.event_code}` }
                    : null),
                  ...(metadata?.label ? { label: `${metadata?.label}` } : null),
                  ...(metadata?.description
                    ? { description: `${metadata?.description}` }
                    : null),
                }),
              },
            );

            const addEventMetadataResult = await addEventMetadataReq.json();
            eventsCreted = addEventMetadataResult;
            if (
              addEventMetadataResult?.reason ||
              addEventMetadataResult.message
            ) {
              logger.error(
                `Unable to add event metadata: reason = "${addEventMetadataResult.reason}", message = "${addEventMetadataResult.message}"`,
              );
              return errorResponse(
                500,
                `Unable to add event metadata: reason = "${addEventMetadataResult.reason}", message = "${addEventMetadataResult.message}"`,
                logger,
              );
            }
          }
        }
      }
    }

    const response = {
      statusCode: 200,
      body: {
        providers: providersCreated,
        events: eventsCreted,
      },
    };

    // log the response status code
    logger.info(`${response.statusCode}: successful request`);
    return response;
  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, "server error", logger);
  }
}

exports.main = main;
