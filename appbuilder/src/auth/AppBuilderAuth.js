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

async function getOAuthToken(params) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  //myHeaders.append("Cookie", "ftrset=984; relay=318f5287-4b47-4d73-932f-3a35c6319c62");

  var urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", "client_credentials");
  urlencoded.append("client_id", params.APPBUILDER_CLIENT_ID);
  urlencoded.append("client_secret", params.APPBUILDER_CLIENT_SECRET);
  urlencoded.append("scope", params.APPBUILDER_CLIENT_SCOPE);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  const result = await fetch(
    params.APPBUILDER_CLIENT_OAUTH_URL,
    requestOptions,
  );
  const tokenResponse = await result.json();

  console.log("access_token", tokenResponse.access_token);
  return tokenResponse.access_token;
}
module.exports = {
  getOAuthToken,
};
