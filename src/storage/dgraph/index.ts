import axios from 'axios'
import { Logger } from '@cloudgraph/sdk'
import { StorageEngine } from '../types'

export default class DgraphEngine implements StorageEngine {
  constructor(config: any) {
    this.connectionHost = config.host
    this.logger = config.logger
    this.axiosPromises = []
  }

  connectionHost: string

  logger: Logger

  axiosPromises: (() => Promise<any>)[]

  // set host(host: string) {
  //   if (host) {
  //     return host
  //   }
  //   if (process.env.DGRAPH_HOST) {
  //     return process.env.DGRAPH_HOST
  //   }
  // }
  async healthCheck(showInitialStatus = true): Promise<boolean> {
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

  get host(): string {
    return this.connectionHost
  }

  async setSchema(schema: string[]): Promise<void> {
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

  /**
   * Add Service Mutation to axiosPromises Array
   */
  push(data: { query: string; variables: { input: any } }): void {
    this.axiosPromises.push(() =>
      axios({
        url: `${this.host}/graphql`,
        method: 'post',
        data,
      })
        .then(res => {
          if (res.data) {
            this.logger.debug(res.data)
          }

          if (res.data.errors) {
            return Promise.reject(res.data.errors)
          }

          return res.data
        })
        .catch(error => Promise.reject(error))
    )
  }

  /**
   * Executes mutations sequentially into Dgraph
   */
  async run(): Promise<void> {
    for (const mutation of this.axiosPromises) {
      await mutation()
    }
  }
}
