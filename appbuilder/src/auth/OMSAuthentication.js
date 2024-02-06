const axios = require("axios");
// import axios from 'axios';
const fs = require("fs");
const fetch = require("node-fetch");
const https = require("https");
const { Core } = require("@adobe/aio-sdk");
const { get, save, init } = require("../config/StateStore");
const { OMS_API, CONFIG } = require("../config/constant");

async function login(params, reAuth = false, isAdmin) {
  await init();
  const logger = Core.Logger("OMSAuthentication.Login", {
    level: params.LOG_LEVEL || "info",
  });
  //Check if token is already available then return token
  if (!reAuth && (await isTokenAvailable())) {
    const token = await get(CONFIG.OMS_TOKEN_NAME);
    logger.info("Token is already avaialble");
    return token;
  } else {
    try {
      // retrieve P12 certificate
      const cert = await fs.readFileSync(CONFIG.LOGIN_CERTIFICATE_FILE);
      let loginID = isAdmin ? params.OMS_ADMIN_USERNAME : params.OMS_USERNAME;
      let password = isAdmin ? params.OMS_ADMIN_PASSWORD : params.OMS_PASSWORD;
      console.log("loginId", loginID, password);

      // call login endpoint passing client certificate
      const request = await fetch(params.OMS_API_BASE_URL + OMS_API.LOGIN, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        agent: new https.Agent({
          pfx: cert,
          passphrase: params.OMS_CLIENT_CERT_PASS,
        }),
        body: JSON.stringify({
          LoginID: `${loginID}`,
          Password: `${password}`,
        }),
      });
      const loginResponse = await request.json();
      logger.info(
        "Login Successfully and Response from login function :",
        loginResponse,
      );

      logger.info(
        "Saving token to cache.",
        "OMS_TOKEN :" + loginResponse.UserToken,
      );
      await save(CONFIG.OMS_TOKEN_NAME, loginResponse.UserToken); //TODO: Add Token Key to Constant file
      await save(CONFIG.OMS_ORG, loginResponse.OrganizationCode);
      return {
        token: loginResponse.UserToken,
        orgId: loginResponse.OrganizationCode,
      };
    } catch (ex) {
      console.log(ex);
      return null;
    }
  }
}

async function getUserDetails(param, isAdmin = false) {
  try {
    let tokenAvailable = await isTokenAvailable(isAdmin ? true : false);
    if (tokenAvailable) {
      let token = isAdmin
        ? await get(CONFIG.OMS_ADMIN_TOKEN_NAME)
        : await get(CONFIG.OMS_TOKEN_NAME);
      let orgId = await get(CONFIG.OMS_ORG);
      console.log("getUserDetails :token," + token + " ,orgId" + orgId);
      return {
        token,
        orgId,
      };
    } else {
      return await login(param, true, isAdmin ? true : false);
    }
  } catch (ex) {
    return await login(param, true, isAdmin ? true : false);
  }
}

async function isTokenAvailable(isAdmin) {
  const token = isAdmin
    ? await get(CONFIG.OMS_ADMIN_TOKEN_NAME)
    : await get(CONFIG.OMS_TOKEN_NAME);
  const orgId = await get(CONFIG.OMS_ORG);

  if (token != undefined && orgId != undefined) {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  login,
  getUserDetails,
  isTokenAvailable,
};
