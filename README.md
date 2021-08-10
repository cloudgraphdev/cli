CloudGraph CLI
===========

Scan cloud infrastructure and query it with GraphQL

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cloud-graph.svg)](https://npmjs.org/package/cloud-graph)
[![Downloads/week](https://img.shields.io/npm/dw/cloud-graph.svg)](https://npmjs.org/package/cloud-graph)
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
cloud-graph init
```

Launch Dgraph instance
```bash
cloud-graph launch
```

Scan for infrastructure updates for all configured providers
```bash
cloud-graph scan
```

Visit http://localhost:8000 from your browser to access the [Ratel console](https://dgraph.io/docs/ratel/console/) to run queries, mutations and visualizations on all of your cloud infrastructure! 
<!-- quickstartstop -->

# Commands
<!-- commands -->
* [`cloud-graph help [COMMAND]`](#cloud-graph-help-command)
* [`cloud-graph init [PROVIDER]`](#cloud-graph-init-provider)
* [`cloud-graph launch [PROVIDER]`](#cloud-graph-launch-provider)
* [`cloud-graph load [PROVIDER]`](#cloud-graph-load-provider)
* [`cloud-graph scan [PROVIDER]`](#cloud-graph-scan-provider)

## `cloud-graph help [COMMAND]`

display help for cloud-graph

```
USAGE
  $ cloud-graph help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `cloud-graph init [PROVIDER]`

Set initial configuration for providers

```
USAGE
  $ cloud-graph init [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph    Set where dgraph is running (default localhost:8080)
  -r, --resources
  -s, --storage=storage  Select a storage engine to use. Currently only supports Dgraph
  --dev                  Turn on developer mode
  --directory=directory  Set the folder where CloudGraph will store data. (default cg)

EXAMPLES
  $ cg init
  $ cg init aws [Initialize AWS provider]
  $ cg init aws -r [Specify resources to crawl]
```

_See code: [src/commands/init.ts](https://github.com/autocloud/cloud-graph/blob/v0.0.1/src/commands/init.ts)_

## `cloud-graph launch [PROVIDER]`

Launch an instance of Dgraph to store data

```
USAGE
  $ cloud-graph launch [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph    Set where dgraph is running (default localhost:8080)
  -s, --storage=storage  Select a storage engine to use. Currently only supports Dgraph
  --dev                  Turn on developer mode
  --directory=directory  Set the folder where CloudGraph will store data. (default cg)

EXAMPLE
  $ cg launch
```

_See code: [src/commands/launch.ts](https://github.com/autocloud/cloud-graph/blob/v0.0.1/src/commands/launch.ts)_

## `cloud-graph load [PROVIDER]`

Load a specific version of your CloudGraph data

```
USAGE
  $ cloud-graph load [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph    Set where dgraph is running (default localhost:8080)
  -s, --storage=storage  Select a storage engine to use. Currently only supports Dgraph
  --dev                  Turn on developer mode
  --directory=directory  Set the folder where CloudGraph will store data. (default cg)

EXAMPLES
  $ cg load [Load data for all providers configured]
  $ cg load aws [Load data for AWS]
```

_See code: [src/commands/load.ts](https://github.com/autocloud/cloud-graph/blob/v0.0.1/src/commands/load.ts)_

## `cloud-graph scan [PROVIDER]`

Scan one or multiple providers data to be queried through Dgraph

```
USAGE
  $ cloud-graph scan [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph    Set where dgraph is running (default localhost:8080)
  -s, --storage=storage  Select a storage engine to use. Currently only supports Dgraph
  --dev                  Turn on developer mode
  --directory=directory  Set the folder where CloudGraph will store data. (default cg)

EXAMPLES
  $ cg scan
  $ cg scan aws
  $ cg scan aws --dgraph http://localhost:1000 [Save data in dgraph running on port 1000]
  $ cg scan aws --no-serve [Do not start the query engine]
```

_See code: [src/commands/scan.ts](https://github.com/autocloud/cloud-graph/blob/v0.0.1/src/commands/scan.ts)_
<!-- commandsstop -->
