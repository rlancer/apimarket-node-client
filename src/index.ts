import axios from 'axios'
import querystring from 'querystring'
import jsonwebtoken from 'jsonwebtoken'
import { inspect } from 'util'
import shortid from 'shortid'

const handleError = (error: any) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(inspect(error.response.data, false, 10, true))
    console.log(error.response.status)
    // console.log(error.response.headers)

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

type  TGetChannelResponse = {
  notificationChannel: TNotificationChannel
}


type TGetChannelsResponse = {
  notificationChannelList: {
    notificationChannel: Array<TNotificationChannel>
  }
}


const BASEURL_WS = 'wss://oauth-cpaas.att.com'
const BASEURL = 'https://oauth-cpaas.att.com/cpaas'

type TAuthenticateProject = {
  grant_type: string
  client_secret: string
  client_id: string
  scope: string
}

type TAuthenticateUser = {
  username: string
  password: string
  grant_type: string
  client_id: string
  scope: string
}

type TJWT = {
  jti: string
  exp: number
  nbf: number
  iat: number
  iss: string
  aud: string
  sub: string
  typ: string
  azp: string
  auth_time: number
  session_state: any
  acr: any
  clientId: any
  email_verified: any
  clientHost: any
  preferred_username: any
  clientAddress: any
  email: any
}

type TAuthConfig = TAuthenticateProject | TAuthenticateUser

class APIMarketplaceClient {

  private id_token?: string | null
  private access_token?: string | null
  private decodedToken?: TJWT
  private authResponse?: any
  private authConfig: TAuthConfig

  private get preferred_username(): string {
    return (this.decodedToken as TJWT).preferred_username
  }

  public constructor(config: TAuthConfig) {
    this.authConfig = config
  }


  private preRequest() {
    return this.getTokensAndRefreshIfNeeded()
  }

  public async getTokensAndRefreshIfNeeded() {

    if (this.decodedToken) {

      const timeleft = (this.decodedToken.exp * 1000) - (new Date()).getTime()

//      console.log('time left on token', timeleft)

      if (timeleft < 5000) {
        return await this.forceGetTokens()
      } else {
        //      console.log('No need to refresh token')
        return { id_token: this.id_token, access_token: this.access_token, id_token_decoded: this.decodedToken }
      }

    } else {
      return await this.forceGetTokens()
    }
  }

  public async forceGetTokens() {
    console.log('forging fetch of new token')
    this.authResponse = await axios.post('https://oauth-cpaas.att.com/cpaas/auth/v1/token', querystring.stringify(this.authConfig),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
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
    await this.preRequest()

    const resp = await axios.get(`${BASEURL}/smsmessaging/v1/${this.preferred_username}/inbound/subscriptions`, {
      headers: {
        Authorization: `Bearer ${this.access_token}`
      }
    })

    return resp.data
  }

  async getSMSHistory() {

    await this.preRequest()


    const resp = await axios.get(`${BASEURL}/smsmessaging/v1/${this.preferred_username}/remoteAddresses?max=50`, {
      headers: {
        Authorization: `Bearer ${this.access_token}`
      }
    })

    return resp.data
  }

  async createChannel({ clientCorrelator, xWebhookURL = '', xAuthorization = '' }: { clientCorrelator: string, xWebhookURL?: string, xAuthorization?: string }) {
    await this.preRequest()

    try {
      const resp = await axios.post(`${BASEURL}/notificationchannel/v1/${this.preferred_username}/channels`, {
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

      const data: TGetChannelResponse = resp.data
      return data
    } catch (error) {
      handleError(error)
      throw error
    }
  }


  async getChannels(): Promise<TGetChannelsResponse> {
    await this.preRequest()

    const resp = await axios.get(`${BASEURL}/notificationchannel/v1/${this.preferred_username}/channels`, {
      headers: {
        Authorization: `Bearer ${this.access_token}`
      }
    })

    return resp.data
  }

  async sendSMS({ toAddress, fromAddress, message, clientCorrelator }: { toAddress: string, fromAddress: string, message: string, clientCorrelator: string }) {
    await this.preRequest()

    try {

      const txt = await axios.post(`${BASEURL}/smsmessaging/v1/${this.preferred_username}/outbound/${fromAddress}/requests`, {

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
      throw error
    }
  }

  async simpleSmsSend({ toAddress, fromAddress, message, callbackUrl = '' }: { fromAddress: string, toAddress: string, message: string, callbackUrl?: string }) {

    await this.preRequest()

    const fromFormatted= formatPhone(fromAddress)
    const toFormatted = formatPhone(toAddress)

    const channels = await this.getChannels()

    let clientCorrelator

    // should see if callbackurl matches
    if (channels.notificationChannelList.notificationChannel.length > 0) {
      clientCorrelator = channels.notificationChannelList.notificationChannel[0].clientCorrelator

    } else {
      clientCorrelator = shortid.generate()

      const createChan = await this.createChannel({
        clientCorrelator: clientCorrelator,
        xAuthorization: '',
        xWebhookURL: callbackUrl
      })
    }

    this.sendSMS({ clientCorrelator, fromAddress:fromFormatted, toAddress:toFormatted, message })
  }
}

export { APIMarketplaceClient }
