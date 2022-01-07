import express from 'express'
import { altairExpress } from 'altair-express-middleware'
import expressPlayground from 'graphql-playground-middleware-express'
import { Server } from 'http'

function renderVoyagerPage(options: { endpointUrl: string }): string {
  const { endpointUrl } = options
  const version = '1.0.0-rc.31'
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset=utf-8 />
  <meta name="viewport" content="user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
  <title>GraphQL Voyager</title>
  <style>
    body {
      padding: 0;
      margin: 0;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }
    #voyager {
      height: 100vh;
    }
  </style>
  <link rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/graphql-voyager@${version}/dist/voyager.css"
  />
  <script src="https://cdn.jsdelivr.net/fetch/2.0.1/fetch.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/react@16/umd/react.production.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@16/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/graphql-voyager@${version}/dist/voyager.min.js"></script>
</head>
<body>
  <main id="voyager">
    <h1 style="text-align: center; color: #5d7e86;"> Loading... </h1>
  </main>
  <script>
    window.addEventListener('load', function(event) {
      function introspectionProvider(introspectionQuery) {
        return fetch('${endpointUrl}', {
          method: 'post',
          headers: Object.assign({}, {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({query: introspectionQuery }),
          credentials: 'omit',
        }).then(function (response) {
          return response.text();
        }).then(function (responseBody) {
          try {
            return JSON.parse(responseBody);
          } catch (error) {
            return responseBody;
          }
        });
      }
      GraphQLVoyager.init(document.getElementById('voyager'), {
        introspection: introspectionProvider,
        displayOptions: ${JSON.stringify({})},
      })
    })
  </script>
</body>
</html>
`
}

const voyagerMiddleware = (options: { endpointUrl: string }) => {
  return (_req: any, res: any): void => {
    res.setHeader('Content-Type', 'text/html')
    res.write(renderVoyagerPage(options))
    res.end()
  }
}
export default class QueryEngine {
  constructor(port: string) {
    this.port = port
  }

  port

  startServer(host: string): Promise<Server> {
    return new Promise(resolve => {
      const app = express()

      app.use(
        '/altair',
        altairExpress({
          endpointURL: `${host}/graphql`,
          initialQuery: '{ queryawsAlb { arn }}',
          initialSettings: {
            addQueryDepthLimit: 3,
          },
        })
      )

      app.use('/voyager', voyagerMiddleware({ endpointUrl: `${host}/graphql` }))

      // TODO: rework QueryEngine to do this better and only serve one
      app.get(
        '/playground',
        expressPlayground({
          endpoint: `${host}/graphql`,
          settings: {
            'request.globalHeaders': {},
            'editor.cursorShape': 'line',
            'editor.fontFamily': '\'Source Code Pro\', \'Consolas\', \'Inconsolata\', \'Droid Sans Mono\', \'Monaco\', monospace',
            'editor.fontSize': 14,
            'editor.reuseHeaders': true,
            'editor.theme': 'dark',
            'general.betaUpdates': false,
            'request.credentials': 'omit',
            'schema.polling.enable': false,
            'schema.polling.endpointFilter': '',
            'schema.polling.interval': 100000000,
            'tracing.hideTracingResponse': true,
            'tracing.tracingSupported': false,
          },
        })
      )

      const server = app.listen(Number(this.port), () => {
        resolve(server)
      })
    })
  }
}
