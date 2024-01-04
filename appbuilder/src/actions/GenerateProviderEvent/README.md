# Generate Providers Event Setup Runtime Action

## Config

### `.env`

You can generate an skeleton of the `.env` file by running

```bash
cp .env.dist .env
```

The generated `.env` file describes itself where to find any configuration value needed

```bash
# URLS
OAUTH_BASE_URL=https://ims-na1.adobelogin.com/ims/token/
IO_MANAGEMENT_BASE_URL=https://api.adobe.io/events/

# OAuth configs
# The following values can be copied from the Credential details page in AppBuilder under Organization > Project > Workspace > OAuth Server-to-Server
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
OAUTH_SCOPES=

# Workspace configs
# The following values can be copied from the JSON downloadable in AppBuilder from Organization > Project > Workspace
# IO_CONSUMER corresponds to project.org.id
# IO_PROJECT_ID corresponds to project.id
# IO_WORKSPACE_ID corresponds to project.workspace.id
IO_CONSUMER_ID=
IO_PROJECT_ID=
IO_WORKSPACE_ID=
```

### `app.config.yaml`

The runtime action is configured as follows

```bash
application:
  actions: actions
  runtimeManifest:
    packages:
      providers-runtime-action:
        license: Apache-2.0
        actions:
          generic:
            function: actions/generic/index.js
            web: 'yes'
            runtime: nodejs:16
            inputs:
              LOG_LEVEL: debug
              API_ENDPOINT: $API_ENDPOINT
              OAUTH_BASE_URL: $OAUTH_BASE_URL
              OAUTH_CLIENT_ID: $OAUTH_CLIENT_ID
              OAUTH_CLIENT_SECRET: $OAUTH_CLIENT_SECRET
              OAUTH_SCOPES: $OAUTH_SCOPES
              IO_MANAGEMENT_BASE_URL: $IO_MANAGEMENT_BASE_URL
              IO_CONSUMER_ID: $IO_CONSUMER_ID
              IO_PROJECT_ID: $IO_PROJECT_ID
              IO_WORKSPACE_ID: $IO_WORKSPACE_ID
            annotations:
              require-adobe-auth: yes
              final: true
            relations:
              event-listener-for: []
```

## Invoking the runtime action

### Request

The runtime action requires adobe authorization, hence the following headers needs to be passed on

- `Authorization`: its value should be a bearer token. [This page](https://developer.adobe.com/developer-console/docs/guides/authentication/ServerToServerAuthentication/implementation/) describes the steps to generate an access token.
- `x-gw-ims-org-id`: its value is the IMS Org Id. It can be found in the Adobe Developer Console workspace JSON

The body payload is in JSON format and supports N providers with N events to be registered in one go

```bash
REQUEST BODY SCHEMA application/json
providers:          array  | providers to be created    #required
  label:            string | provider label             #required
  description:      string | provider description       #optional
  docs_url:         string | provider documentation URL #optional
  events:           array  | provider events metadata   #optional
    event_code:     string | event code                 #required
    event_label:    string | event label                #required
    description:    string | event description          #required
```

### Request samples for creating Provider and Events togather

```bash
curl --request POST \
  --url https://283976-providersrtaction-stage.adobeioruntime.net/api/v1/web/providers-runtime-action/generic \
  --header 'Authorization: Bearer ' \
  --header 'Content-Type: application/json' \
  --header 'x-gw-ims-org-id: 080936685AD0D2200A495D66@AdobeOrg' \
  --data '{
    "action":"PROVIDER_AND_EVENT",
    "providers": [
        {
            "label": "One Custom Event Provider",
            "description": "One custom event provider created by a runtime action",
            "docs_url": "https://yourdocumentation.url.if.any",
            "events": [
                {
                    "event_code": "one.random.event.code",
                    "label": "one random event code",
                    "description": "one random event code"
                },
                {
                    "event_code": "two.random.event.code",
                    "label": "two random event code",
                    "description": "two random event code"
                }
            ]
        },
        {
            "label": "Other Custom Event Provider",
            "description": "Other custom event provider created by a runtime action",
            "docs_url": "https://yourdocumentation.url.if.any",
            "events": [
                {
                    "event_code": "other.random.event.code",
                    "label": "other random event code",
                    "description": "other random event code"
                },
                {
                    "event_code": "another.random.event.code",
                    "label": "another random event code",
                    "description": "another random event code"
                }
            ]
        }
    ]
}'
```

### Responses

### Request samples for creating only Events based on Provider Id you pass

```bash
curl --request POST \
  --url https://283976-providersrtaction-stage.adobeioruntime.net/api/v1/web/providers-runtime-action/generic \
  --header 'Authorization: Bearer ' \
  --header 'Content-Type: application/json' \
  --header 'x-gw-ims-org-id: 080936685AD0D2200A495D66@AdobeOrg' \
  --data '{
    "action":"EVENT",
    "providers": [
        {
            "id":"00000000-0000-0000-0000-000000000000",
            "label": "One Custom Event Provider",
            "description": "One custom event provider created by a runtime action",
            "docs_url": "https://yourdocumentation.url.if.any",
            "events": [
                {
                    "event_code": "one.random.event.code",
                    "label": "one random event code",
                    "description": "one random event code"
                },
                {
                    "event_code": "two.random.event.code",
                    "label": "two random event code",
                    "description": "two random event code"
                }
            ]
        },
        {
            "id":"00000000-0000-0000-0000-000000000000",
            "label": "Other Custom Event Provider",
            "description": "Other custom event provider created by a runtime action",
            "docs_url": "https://yourdocumentation.url.if.any",
            "events": [
                {
                    "event_code": "other.random.event.code",
                    "label": "other random event code",
                    "description": "other random event code"
                },
                {
                    "event_code": "another.random.event.code",
                    "label": "another random event code",
                    "description": "another random event code"
                }
            ]
        }
    ]
}'
```

### Responses

```bash
200 Success
===========
RESPONSE SCHEMA: application/json
providers:       array  | providers created  #required
  id:            string | provider id        #optional
  label:         string | provider label     #required

400 Bad Request
===============
RESPONSE SCHEMA: application/json
error:           string | error message      #required

401 Unauthorized
================
RESPONSE SCHEMA: application/json
error:           string | error message      #required

403 Forbidden
=============
RESPONSE SCHEMA: application/json
error:           string | error message      #required

500 Internal Server Error
=========================
RESPONSE SCHEMA: application/json
error:           string | error message      #required
```

### Response samples

```bash
200 Success
===========
{
    "providers": [
        {
            "id": "c964e7be-f066-4bdf-8ae5-4454e9914228",
            "label": "One Custom Event Provider"
        },
        {
            "id": "9bfa4439-43b9-4d24-aff6-b7393ac86b94",
            "label": "Other Custom Event Provider"
        }
    ]
}

400 Bad Request
===============
{
    "error": "missing parameter(s) 'providers'"
}

401 Unauthorized
================
{
    "error": "cannot authorize request, reason: missing authorization header"
}

403 Forbidden
=============
{
    "error": "request is invalid, reason: failed authorization. Please verify your token and organization id."
}

500 Internal Server Error
=========================
{
    "error": "Unable to create provider: reason = \"Invalid Request. Request id: KQhhYkqiiuY0bdJtJ8EP3VZaHgvq2IJy.\", message = \"Provider's label cannot be null.\""
}
```
