AT&T API Marketplace - Community Nodejs Client 
---

[![npm version](https://badge.fury.io/js/%40collaborizm%2Fapimarket.svg)](https://badge.fury.io/js/%40collaborizm%2Fapimarket)

Get started with the new API Marketplace at 
https://apimarket.att.com


## Install 
> $ npm i @collaborizm/apimarket

import { APIMarketplaceClient } from '@collaborizm/apimarket'

type TProps = {
  user1: TVideoChatProps
  user2: TVideoChatProps
}
export default class Kandy extends Component <TProps, {}> {

## Useage
 ```javascript

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
      
      
``` 