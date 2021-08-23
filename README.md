CloudGraph CLI

===========

A type-safe way to query your cloud assets and configuration with **GraphQL**. Easily understand relationships and solve a host of complex **security**, **compliance**, and **governance** challenges with ease.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

[![Version](https://img.shields.io/npm/v/cloud-graph.svg)](https://npmjs.org/package/@cloudgraph/cli)

[![Downloads/week](https://img.shields.io/npm/dw/cloud-graph.svg)](https://npmjs.org/package/@cloudgraph/cli)

[![License](https://img.shields.io/npm/l/cloud-graph.svg)](https://github.com/autocloud/cloud-graph/blob/master/package.json)

<!-- toc -->
* [Install](#install)
* [Quick Start](#quick-start)
* [Commands](#commands)
<!-- tocstop -->

# Install

<!-- install -->

```bash
npm install -g @cloudgraph/cli
```

<!-- installstop -->

# Quick Start

<!-- quickstart -->

Initialize CloudGraph configuration

```bash
cg init
```

Launch Dgraph instance

```bash
cg launch
```

Scan for infrastructure updates for all configured providers

```bash
cg scan
```

The query tool you selected during the `INIT` command will be opened in your preferred browser to run queries, mutations and visualizations on all of your cloud infrastructure!
You may also use any GraphQL query tool you would like by connecting it to http://localhost:8080/graphql.

## Example Query

Find Unencrypted EBS Volumes.

```
query {
  queryawsEbs(filter: { isEncrypted: false }) {
    id
    arn
    availabilityZone
    encrypted
  }
}
```

You can find more example queries in the `examples` folder

<!-- quickstartstop -->

# Commands

<!-- commands -->
* [`cg help [COMMAND]`](#cg-help-command)
* [`cg init [PROVIDER]`](#cg-init-provider)
* [`cg launch [PROVIDER]`](#cg-launch-provider)
* [`cg load [PROVIDER]`](#cg-load-provider)
* [`cg scan [PROVIDER]`](#cg-scan-provider)
* [`cg serve [PROVIDER]`](#cg-serve-provider)

## `cg help [COMMAND]`

display help for cg

```
USAGE
  $ cg help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `cg init [PROVIDER]`

Set initial configuration for providers

```
USAGE
  $ cg init [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph              Set where dgraph is running (default localhost:8080)
  -p, --port=port                  Set port to serve query engine
  -q, --query-engine=query-engine  Query engine to launch
  -r, --resources
  -s, --storage=storage            Select a storage engine to use. Currently only supports Dgraph
  --dev                            Turn on developer mode
  --directory=directory            Set the folder where CloudGraph will store data. (default cg)
  --no-serve                       Set to false to not serve a query engine

EXAMPLES
  $ cg init
  $ cg init aws [Initialize AWS provider]
  $ cg init aws -r [Specify resources to crawl]
```

_See code: [src/commands/init.ts](https://github.com/autocloud/cloud-graph/blob/v0.1.1/src/commands/init.ts)_

## `cg launch [PROVIDER]`

Launch an instance of Dgraph to store data

```
USAGE
  $ cg launch [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph              Set where dgraph is running (default localhost:8080)
  -p, --port=port                  Set port to serve query engine
  -q, --query-engine=query-engine  Query engine to launch
  -s, --storage=storage            Select a storage engine to use. Currently only supports Dgraph
  --dev                            Turn on developer mode
  --directory=directory            Set the folder where CloudGraph will store data. (default cg)
  --no-serve                       Set to false to not serve a query engine

EXAMPLE
  $ cg launch
```

_See code: [src/commands/launch.ts](https://github.com/autocloud/cloud-graph/blob/v0.1.1/src/commands/launch.ts)_

## `cg load [PROVIDER]`

Load a specific version of your CloudGraph data

```
USAGE
  $ cg load [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph              Set where dgraph is running (default localhost:8080)
  -p, --port=port                  Set port to serve query engine
  -q, --query-engine=query-engine  Query engine to launch
  -s, --storage=storage            Select a storage engine to use. Currently only supports Dgraph
  --dev                            Turn on developer mode
  --directory=directory            Set the folder where CloudGraph will store data. (default cg)
  --no-serve                       Set to false to not serve a query engine

EXAMPLES
  $ cg load [Load data for all providers configured]
  $ cg load aws [Load data for AWS]
```

_See code: [src/commands/load.ts](https://github.com/autocloud/cloud-graph/blob/v0.1.1/src/commands/load.ts)_

## `cg scan [PROVIDER]`

Scan one or multiple providers data to be queried through Dgraph

```
USAGE
  $ cg scan [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph              Set where dgraph is running (default localhost:8080)
  -p, --port=port                  Set port to serve query engine
  -q, --query-engine=query-engine  Query engine to launch
  -s, --storage=storage            Select a storage engine to use. Currently only supports Dgraph
  --dev                            Turn on developer mode
  --directory=directory            Set the folder where CloudGraph will store data. (default cg)
  --no-serve                       Set to false to not serve a query engine

EXAMPLES
  $ cg scan
  $ cg scan aws
  $ cg scan aws --dgraph http://localhost:1000 [Save data in dgraph running on port 1000]
  $ cg scan aws --no-serve [Do not start the query engine]
```

_See code: [src/commands/scan.ts](https://github.com/autocloud/cloud-graph/blob/v0.1.1/src/commands/scan.ts)_

## `cg serve [PROVIDER]`

Serve a GraphQL query tool to query your CloudGraph data.

```
USAGE
  $ cg serve [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph              Set where dgraph is running (default localhost:8080)
  -p, --port=port                  Set port to serve query engine
  -q, --query-engine=query-engine  Query engine to launch
  -s, --storage=storage            Select a storage engine to use. Currently only supports Dgraph
  --dev                            Turn on developer mode
  --directory=directory            Set the folder where CloudGraph will store data. (default cg)
  --no-serve                       Set to false to not serve a query engine

EXAMPLE
  $ cg serve
```

_See code: [src/commands/serve.ts](https://github.com/autocloud/cloud-graph/blob/v0.1.1/src/commands/serve.ts)_
<!-- commandsstop -->
