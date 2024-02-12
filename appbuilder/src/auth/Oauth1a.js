/*
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */
const fetch = require("node-fetch");
const Oauth1a = require("oauth-1.0a");
const crypto = require("crypto");
const got = require("got");
const { init, get, save } = require("../config/StateStore");
const { CONFIG } = require("../config/constant");

async function getOauthClient(options, logger) {
  const instance = {};
  await init();
  // Remove trailing slash if any
  const serverUrl = options.url;
  const apiVersion = options.version;
  const oauth = Oauth1a({
    consumer: {
      key: options.consumerKey,
      secret: options.consumerSecret,
    },
    signature_method: "HMAC-SHA256",
    hash_function: hashFunctionSha256,
  });
  const token = {
    key: options.accessToken,
    secret: options.accessTokenSecret,
  };

  function hashFunctionSha256(baseString, key) {
    return crypto.createHmac("sha256", key).update(baseString).digest("base64");
  }

  async function apiCall(requestData, customHeaders = {}) {
    try {
      logger.info(
        "Fetching URL: " +
          requestData.url +
          " with method: " +
          requestData.method,
      );

      let existingToken = await getToken();
      let oauthResponse = oauth.authorize(requestData, token);

      const headers = {
        ...(existingToken
          ? { Authorization: "Bearer " + existingToken }
          : oauth.toHeader(oauthResponse)),
        ...customHeaders,
      };

      console.log("headers", headers);

      await save(CONFIG.ADOBE_COMMERCE_TOKEN_NAME, oauthResponse.oauth_token);

      let requestOptions = {
        method: requestData.method,
        headers,
        body: requestData.body,
        redirect: "follow",
      };

      const res = await fetch(requestData.url, requestOptions);
      if (!res.ok) {
        throw new Error(
          "request to " +
            requestData.url +
            " failed with status code " +
            res.status +
            " Error:" +
            res,
        );
      }
      const content = await res.json();
      return content;

      // return await got(requestData.url, {
      //     method: requestData.method,
      //     headers,
      //     body: requestData.body,
      //     responseType: 'json'
      // }).json()
    } catch (error) {
      console.log("error here is", error);
      logger.error(error);

      throw error;
    }
  }

  instance.consumerToken = async function (loginData) {
    return apiCall({
      url: createUrl("integration/customer/token"),
      method: "POST",
      body: loginData,
    });
  };

  instance.get = async function (resourceUrl) {
    const requestData = {
      url: createUrl(resourceUrl),
      method: "GET",
    };
    return apiCall(requestData);
  };

  function createUrl(resourceUrl) {
    return serverUrl + apiVersion + "/" + resourceUrl;
  }

  instance.post = async function (resourceUrl, data, customHeaders = {}) {
    const requestData = {
      url: createUrl(resourceUrl),
      method: "POST",
      body: data,
    };
    return apiCall(requestData, customHeaders);
  };

  instance.put = async function (resourceUrl, data) {
    const requestData = {
      url: createUrl(resourceUrl),
      method: "PUT",
      body: data,
    };
    return apiCall(requestData);
  };

  instance.delete = async function (resourceUrl) {
    const requestData = {
      url: createUrl(resourceUrl),
      method: "DELETE",
    };
    return apiCall(requestData);
  };

  return instance;
}

async function getToken() {
  let token = await get(CONFIG.ADOBE_COMMERCE_TOKEN_NAME);
  if (token) {
    return token;
  }
  return undefined;
}

async function getCommerceOauthClient(options, logger) {
  options.version = "V1";
  options.url = options.url + "rest/";
  return await getOauthClient(options, logger);
}

module.exports = {
  getOauthClient,
  getCommerceOauthClient,
};
