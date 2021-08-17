import axios from 'axios'
import { Logger } from '@cloudgraph/sdk'
import { StorageEngine } from '../types'

export default class DgraphEngine implements StorageEngine {
  constructor(config: any) {
    this.connectionHost = config.host
    this.logger = config.logger
  }

  connectionHost: string

  logger: Logger

  // set host(host: string) {
  //   if (host) {
  //     return host
  //   }
  //   if (process.env.DGRAPH_HOST) {
  //     return process.env.DGRAPH_HOST
  //   }
  // }
  async healthCheck(showInitialStatus = true) {
    showInitialStatus &&
      this.logger.debug(`running dgraph health check at ${this.host}`)
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
      this.logger.warn(
        `dgraph at ${this.host} failed health check. Is dgraph running?`
      )
      this.logger.debug(error)
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
    }).then(res => {
      if (res.data) {
        this.logger.debug(JSON.stringify(res.data))
      }
    })
  }

  push(data: any) {
    return axios({
      url: `${this.host}/graphql`,
      method: 'post',
      data,
    }).then(res => {
      if (res.data) {
        this.logger.debug(JSON.stringify(res.data))
      }
    })
  }
}
