import axios from 'axios'
import {StorageEngine} from '../types'

export default class DgraphEngine implements StorageEngine {
  constructor(config: any) {
    this.connectionHost = config.host
    this.logger = config.logger
  }

  connectionHost: string

  logger: any

  // set host(host: string) {
  //   if (host) {
  //     return host
  //   }
  //   if (process.env.DGRAPH_HOST) {
  //     return process.env.DGRAPH_HOST
  //   }
  // }
  async healthCheck() {
    this.logger.log(`running dgraph health check at ${this.host}`)
    try {
      await axios({
        url: `${this.host}/health?all`,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return true
    } catch (error: any) {
      this.logger.log(`dgraph at ${this.host} failed health check. Is dgraph running?`, {level: 'error'})
      this.logger.log(error, {level: 'error'})
      return false
    }
  }

  get host() {
    return this.connectionHost
  }

  async setSchema(schema: any) {
    await axios({
      url: `${this.host}/admin`,
      method: 'post',
      data: {
        query: `mutation($schema: String!) {
            updateGQLSchema(input: { set: { schema: $schema } }) {
              gqlSchema {
                schema
              }
            }
          }
          `,
        variables: {
          schema: schema.join(),
        },
      },
    })
  }

  push(data: any) {
    return axios({
      url: `${this.host}/graphql`,
      method: 'post',
      data,
    }).then(res => {
      if (res.data) {
        this.logger.log(res.data)
      }
    })
  }
}
