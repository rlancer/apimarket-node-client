import axios from 'axios'
import querystring from 'querystring'
import jsonwebtoken from 'jsonwebtoken'
import { inspect } from 'util'


const handleError = (error: any) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(inspect(error.response.data, false, 10, true))
    console.log(error.response.status)
    console.log(error.response.headers)

    throw error.response.data
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request)
    throw error.request
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error', error.message)
    throw error.message
  }
}


export function formatPhone(phone: string): string {
  const formattedPhone = phone.replace(/[\.\-\s]/g, '')

  if (/^\+[1-9]\d{4,14}$/.test(formattedPhone)) {
    console.log('phone valid', formattedPhone)
    return formattedPhone
  } else {
    if (!formattedPhone.startsWith('+1')) {
      return `+1${formattedPhone}`
    } else {
      if (!formattedPhone.startsWith('1')) {
        return `+${formattedPhone}`
      }
    }

  }

  throw 'Invalid phone number'
}

type TNotificationChannel = {
  callbackURL: string,
  channelData:
    { channelURL: string },
  channelLifetime: number,
  channelType: 'websockets' | 'another' | 'other',
  clientCorrelator: string,
  resourceURL:
    string,
  'x-connCheckRole': 'server' | 'client'
}

type  TGetChanelResponse = {
  notificationChannel: TNotificationChannel
}


type TGetChannelsResponse = {
  notificationChannelList: {
    notificationChannel: Array<TNotificationChannel>
  }
}


const BASEURL_WS = 'wss://oauth-cpaas.att.com'
const BASEURL = 'https://oauth-cpaas.att.com/cpaas'

class APIMarketplaceClient {

  private id_token?: string | null
  private access_token?: string | null
  private decodedToken: any
  private authResponse: any


  public async authenticateUser({ username, password, grant_type, client_id, scope }: { username: string, password: string, grant_type: string, client_id: string, scope: string }) {
    this.authResponse = await axios.post('https://oauth-cpaas.att.com/cpaas/auth/v1/token', querystring.stringify({
      username,
      password,
      grant_type,
      client_id,
      scope
    }))
    return this.decodeAuthToken()
  }

  public async authenticateProject({ grant_type, client_id, client_secret, scope }: { grant_type: string, client_secret: string, client_id: string, scope: string }) {
    this.authResponse = await axios.post('https://oauth-cpaas.att.com/cpaas/auth/v1/token', querystring.stringify({
        grant_type,
        client_id,
        client_secret,
        scope
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    return this.decodeAuthToken()

  }

  private decodeAuthToken() {
    const { id_token, access_token } = this.authResponse.data
    this.id_token = id_token
    this.access_token = access_token
    this.decodedToken = jsonwebtoken.decode(id_token) as any

    return { id_token, access_token, id_token_decoded: this.decodedToken }
  }

  async getInboundSMSSubscriptions() {
    //

    const { preferred_username } = this.decodedToken
    const resp = await axios.get(`${BASEURL}/smsmessaging/v1/${preferred_username}/inbound/subscriptions`, {
      headers: {
        Authorization: `Bearer ${this.access_token}`
      }
    })

    return resp.data
  }

  async getSMSHistory() {
    const { preferred_username } = this.decodedToken
    const resp = await axios.get(`${BASEURL}/smsmessaging/v1/${preferred_username}/remoteAddresses?max=50`, {
      headers: {
        Authorization: `Bearer ${this.access_token}`
      }
    })

    return resp.data
  }

  async createChanel({ clientCorrelator, xWebhookURL, xAuthorization }: { clientCorrelator: string, xWebhookURL: string, xAuthorization: string }) {

    try {

      const { preferred_username } = this.decodedToken
      const resp = await axios.post(`${BASEURL}/notificationchannel/v1/${preferred_username}/channels`, {
        'notificationChannel': {
          channelData: {
            'x-webhookURL': xWebhookURL,
            'x-authorization': xAuthorization
          },
          'channelType': 'Webhooks',
          'clientCorrelator': clientCorrelator
        }
      }, {
        headers: {
          Authorization: `Bearer ${this.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      const data: TGetChanelResponse = resp.data
      return data
    } catch (error) {
      handleError(error)
    }
  }


  async getChanels(): Promise<TGetChannelsResponse> {
    const { preferred_username } = this.decodedToken
    const resp = await axios.get(`${BASEURL}/notificationchannel/v1/${preferred_username}/channels`, {
      headers: {
        Authorization: `Bearer ${this.access_token}`
      }
    })

    return resp.data
  }

  async sendSMS({ toAddress, fromAddress, message, clientCorrelator }: { toAddress: string, fromAddress: string, message: string, clientCorrelator: string }) {
    try {
      const { preferred_username } = this.decodedToken

      const txt = await axios.post(`${BASEURL}/smsmessaging/v1/${preferred_username}/outbound/${fromAddress}/requests`, {

          outboundSMSMessageRequest: {
            address: [toAddress],
            clientCorrelator: clientCorrelator,
            outboundSMSTextMessage: { message }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return txt.data
    } catch (error) {
      handleError(error)
    }
  }
}

export { APIMarketplaceClient }
