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

  const apiMarketplaceClient = new APIMarketplaceClient()
  
  const authenticateUser = await apiMarketplaceClient.authenticateUser({
    username: '<USERNAME>',
    password: '<PASSWORD>',
    grant_type: 'password',
    client_id: '<CLIENT_ID>',
    scope: 'openid'
  })

  const authenticateProject = await apiMarketplaceClient.authenticateUser({
    username: '<USERNAME>',
    password: '<PASSWORD>',
    grant_type: 'password',
    client_id: '<CLIENT_ID>',
    scope: 'openid'
  })
    
  // returns and object { id_token, access_token, id_token_decoded})          
``` 

# Usage with API Marketplace Javascript SDK
```javascript
 
 
 // Execute authentication on server
 
   const authenticateProject = await apiMarketplaceClient.authenticateUser({
     username: '<USERNAME>',
     password: '<PASSWORD>',
     grant_type: 'password',
     client_id: '<CLIENT_ID>',
     scope: 'openid'
   })
   
   return authenticateProject
  }
 
 
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

    const { id_token, access_token } = value_from_server

    this.kandy.setTokens({ idToken: id_token, accessToken: access_token })

``` 