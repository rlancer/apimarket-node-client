AT&T API Marketplace - Community Nodejs Client 
---

[![npm version](https://badge.fury.io/js/%40collaborizm%2Fapimarket.svg)](https://badge.fury.io/js/%40collaborizm%2Fapimarket)

Get started with the new API Marketplace at 
https://apimarket.att.com

## Install 
`$ npm i @collaborizm/apimarket`

Built with Typescript, types included!

## Authentication
 ```javascript
  import { APIMarketplaceClient } from '@collaborizm/apimarket'

  // for user authentication 
  const apiMarketplaceClient = new APIMarketplaceClient({
                                                            username: '<USERNAME>',
                                                            password: '<PASSWORD>',
                                                            grant_type: 'password',
                                                            client_id: '<CLIENT_ID>',
                                                            scope: 'openid'
                                                          })
  
  // for project authentication                                                           
  const apiMarketplaceClient = new APIMarketplaceClient({
                                                            username: '<USERNAME>',
                                                            password: '<PASSWORD>',
                                                            grant_type: 'password',
                                                            client_id: '<CLIENT_ID>',
                                                            scope: 'openid'
                                                          })
  
  // returns and object { id_token, access_token, id_token_decoded})          
``` 

## Usage with API Marketplace Javascript SDK
```javascript

// Execute authentication on server

// getValidToken will automatically refresh your access token if it's about to expire  
const tokenFromServer = await apiMarketplaceClient.getValidToken() 



 // Include JS SDK included on client  
 
 const kandy = Kandy.create({
      
  logs: {
    logLevel: 'debug'
  },
  authentication: {
    server: {
      base: 'oauth-cpaas.att.com'
    },
    clientCorrelator: 'sampleCorrelator'
  }
})

const { id_token, access_token } = authenticateProject

this.kandy.setTokens({ idToken: id_token, accessToken: access_token })
``` 

## Simple send SMS message 
Creates a communication channel if one doesn't exist and sends an SMS 
```javascript
  await apiMarketplaceClient.simpleSmsSend({
    toAddress: '+15555555555',
    fromAddress: '<ADDRESS_MUST_BE_PROVISIONED>',
    message: 'Hey',
    callbackUrl: 'http://example.com/callback'
  })
```

## REST API Methods 
Creates a communication channel if one doesn't exist and sends an SMS 
```javascript
  await apiMarketplaceClient.simpleSmsSend({
    toAddress: '+15555555555',
    fromAddress: '<ADDRESS_MUST_BE_PROVISIONED>',
    message: 'Hey',
    callbackUrl: 'http://example.com/callback'
  })
```

