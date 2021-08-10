import {altairExpress} from 'altair-express-middleware'
import express from 'express'
import expressPlayground from'graphql-playground-middleware-express'

export default class QueryEngine {
  constructor(port: string) {
    this.port = port
  }

  port

  startServer(host: string) {
    return new Promise(resolve => {
      const app = express()

      app.use('/altair', altairExpress({
        endpointURL: `${host}/graphql`,
        initialQuery: '{ queryaws_alb { arn }}',
        initialSettings: {
          addQueryDepthLimit: 3,
        },
      }))

      // TODO: rework QueryEngine to do this better and only serve one
      app.get('/playground', expressPlayground({ endpoint: `${host}/graphql` }))

      app.listen(Number(this.port), () => {
        resolve(true)
      })
    })
  }
}
