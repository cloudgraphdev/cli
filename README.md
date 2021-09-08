CloudGraph CLI
===========

A type-safe way to query your cloud assets and configuration with  **GraphQL**. Easily understand relationships and solve a host of complex **security**, **compliance**, and **governance** challenges with ease.  <br /> CloudGraph requires **READ ONLY** permissions to run and as such can not make any changes to your cloud infrastructure. For more information on generating the necessary permission please view our [AWS Provider Repo](https://github.com/cloudgraphdev/cloudgraph-provider-aws)

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@cloudgraph/cli.svg)](https://npmjs.org/package/@cloudgraph/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@cloudgraph/cli.svg)](https://npmjs.org/package/@cloudgraph/cli)
[![License](https://img.shields.io/npm/l/@cloudgraph/cli.svg)](https://github.com/cloudgraphdev/cli/blob/master/package.json)

<!-- toc -->
* [Install](#install)
* [Quick Start](#quick-start)
* [Commands](#commands)
* [Query Tools](#query-tools)
<!-- tocstop -->

# Install

<!-- install -->

```bash
npm install -g @cloudgraph/cli
```

<!-- installstop -->

# Quick Start

<!-- quickstart -->

1. Initialize CloudGraph configuration

```bash
cg init
```

2. Launch an instance of [Dgraph](https://dgraph.io/), the graphdb CloudGraph uses to store data.
There are 2 ways to launch an instance. **BOTH** of these require [Docker](https://www.docker.com/) to be installed. The preferred solution is to use our convience command.

```bash
cg launch
```

If you do not want to use this command, for example if you want to launch the Dgraph container in interactive mode, you can use the docker command below.

```bash
  docker run -it -p 8995:5080 -p 8996:6080 -p 8997:8080 -p 8998:9080 -p 8999:8000 -v ~/dgraph:/dgraph --name dgraph dgraph/standalone:v21.03.0
```

3. Scan for infrastructure updates for all configured providers. This command will reach out and read all of the metadata on your cloud assets.

```bash
cg scan
```

The query tool you selected during the `INIT` command will be opened in your preferred browser to run queries, mutations and visualizations on all of your cloud infrastructure!
You may also use any GraphQL query tool you would like by connecting it to http://localhost:8997/graphql.

## Example Query

Find Unencrypted EBS Volumes.

```
query {
  queryawsEbs(filter: { encrypted: false }) {
    id,
    arn,
    availabilityZone,
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
* [`cg provider [PROVIDER]`](#cg-provider-provider)
* [`cg provider:add [PROVIDER]`](#cg-provideradd-provider)
* [`cg provider:install [PROVIDER]`](#cg-providerinstall-provider)
* [`cg provider:list [PROVIDER]`](#cg-providerlist-provider)
* [`cg provider:remove [PROVIDER]`](#cg-providerremove-provider)
* [`cg provider:update [PROVIDER]`](#cg-providerupdate-provider)
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
  -d, --dgraph=dgraph                Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                    Set port to serve query engine
  -q, --query-engine=query-engine    Query engine to launch
  -r, --resources
  -s, --storage=storage              Select a storage engine to use. Currently only supports Dgraph
  --dev                              Turn on developer mode
  --directory=directory              Set the folder where CloudGraph will store data. (default cg)
  --no-serve                         Set to not serve a query engine

EXAMPLES
  $ cg init
  $ cg init aws [Initialize AWS provider]
  $ cg init aws -r [Specify resources to crawl]
```

_See code: [src/commands/init.ts](https://github.com/cloudgraphdev/cli/blob/v0.7.4/src/commands/init.ts)_

## `cg launch [PROVIDER]`

Launch an instance of Dgraph to store data

```
USAGE
  $ cg launch [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                    Set port to serve query engine
  -q, --query-engine=query-engine    Query engine to launch
  -s, --storage=storage              Select a storage engine to use. Currently only supports Dgraph
  --dev                              Turn on developer mode
  --directory=directory              Set the folder where CloudGraph will store data. (default cg)
  --no-serve                         Set to not serve a query engine

EXAMPLE
  $ cg launch
```

_See code: [src/commands/launch.ts](https://github.com/cloudgraphdev/cli/blob/v0.7.4/src/commands/launch.ts)_

## `cg load [PROVIDER]`

Load a specific version of your CloudGraph data

```
USAGE
  $ cg load [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                    Set port to serve query engine
  -q, --query-engine=query-engine    Query engine to launch
  -s, --storage=storage              Select a storage engine to use. Currently only supports Dgraph
  --dev                              Turn on developer mode
  --directory=directory              Set the folder where CloudGraph will store data. (default cg)
  --no-serve                         Set to not serve a query engine

EXAMPLES
  $ cg load [Load data for all providers configured]
  $ cg load aws [Load data for AWS]
```

_See code: [src/commands/load.ts](https://github.com/cloudgraphdev/cli/blob/v0.7.4/src/commands/load.ts)_

## `cg provider [PROVIDER]`

Commands to manage provider modules, run $ cg provider for more info.

```
USAGE
  $ cg provider [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                    Set port to serve query engine
  -q, --query-engine=query-engine    Query engine to launch
  -s, --storage=storage              Select a storage engine to use. Currently only supports Dgraph
  --dev                              Turn on developer mode
  --directory=directory              Set the folder where CloudGraph will store data. (default cg)
  --no-serve                         Set to not serve a query engine
```

_See code: [src/commands/provider/index.ts](https://github.com/cloudgraphdev/cli/blob/v0.7.4/src/commands/provider/index.ts)_

## `cg provider:add [PROVIDER]`

Add new providers

```
USAGE
  $ cg provider add [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                    Set port to serve query engine
  -q, --query-engine=query-engine    Query engine to launch
  -s, --storage=storage              Select a storage engine to use. Currently only supports Dgraph
  --dev                              Turn on developer mode
  --directory=directory              Set the folder where CloudGraph will store data. (default cg)
  --no-serve                         Set to not serve a query engine

ALIASES
  $ cg add

EXAMPLES
  $ cg provider add aws
  $ cg provider add aws@0.12.0
```

_See code: [src/commands/provider/add.ts](https://github.com/cloudgraphdev/cli/blob/v0.7.4/src/commands/provider/add.ts)_

## `cg provider:install [PROVIDER]`

Install providers based on the lock file

```
USAGE
  $ cg provider install [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                    Set port to serve query engine
  -q, --query-engine=query-engine    Query engine to launch
  -s, --storage=storage              Select a storage engine to use. Currently only supports Dgraph
  --dev                              Turn on developer mode
  --directory=directory              Set the folder where CloudGraph will store data. (default cg)
  --no-serve                         Set to not serve a query engine

ALIASES
  $ cg install

EXAMPLE
  $ cg provider install
```

_See code: [src/commands/provider/install.ts](https://github.com/cloudgraphdev/cli/blob/v0.7.4/src/commands/provider/install.ts)_

## `cg provider:list [PROVIDER]`

List currently installed providers and versions

```
USAGE
  $ cg provider list [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                    Set port to serve query engine
  -q, --query-engine=query-engine    Query engine to launch
  -s, --storage=storage              Select a storage engine to use. Currently only supports Dgraph
  --dev                              Turn on developer mode
  --directory=directory              Set the folder where CloudGraph will store data. (default cg)
  --no-serve                         Set to not serve a query engine

ALIASES
  $ cg provider ls
  $ cg list
  $ cg ls

EXAMPLES
  $ cg provider list
  $ cg provider list aws
```

_See code: [src/commands/provider/list.ts](https://github.com/cloudgraphdev/cli/blob/v0.7.4/src/commands/provider/list.ts)_

## `cg provider:remove [PROVIDER]`

Remove currently installed provider

```
USAGE
  $ cg provider remove [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                    Set port to serve query engine
  -q, --query-engine=query-engine    Query engine to launch
  -s, --storage=storage              Select a storage engine to use. Currently only supports Dgraph
  --dev                              Turn on developer mode
  --directory=directory              Set the folder where CloudGraph will store data. (default cg)
  --no-save                          Set to not alter lock file, just delete plugin
  --no-serve                         Set to not serve a query engine

ALIASES
  $ cg remove
  $ cg rm
  $ cg del
  $ cg provider rm
  $ cg provider del

EXAMPLES
  $ cg provider delete
  $ cg provider delete aws
  $ cg provider delete aws --no-save
```

_See code: [src/commands/provider/remove.ts](https://github.com/cloudgraphdev/cli/blob/v0.7.4/src/commands/provider/remove.ts)_

## `cg provider:update [PROVIDER]`

Update currently installed providers

```
USAGE
  $ cg provider update [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                    Set port to serve query engine
  -q, --query-engine=query-engine    Query engine to launch
  -s, --storage=storage              Select a storage engine to use. Currently only supports Dgraph
  --dev                              Turn on developer mode
  --directory=directory              Set the folder where CloudGraph will store data. (default cg)
  --no-serve                         Set to not serve a query engine

ALIASES
  $ cg update

EXAMPLES
  $ cg provider update
  $ cg provider update aws
  $cg provider update aws@0.12.0
```

_See code: [src/commands/provider/update.ts](https://github.com/cloudgraphdev/cli/blob/v0.7.4/src/commands/provider/update.ts)_

## `cg scan [PROVIDER]`

Scan one or multiple providers data to be queried through Dgraph

```
USAGE
  $ cg scan [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                    Set port to serve query engine
  -q, --query-engine=query-engine    Query engine to launch
  -s, --storage=storage              Select a storage engine to use. Currently only supports Dgraph
  --dev                              Turn on developer mode
  --directory=directory              Set the folder where CloudGraph will store data. (default cg)
  --no-serve                         Set to not serve a query engine

EXAMPLES
  $ cg scan
  $ cg scan aws
  $ cg scan aws --dgraph http://localhost:1000 [Save data in dgraph running on port 1000]
  $ cg scan aws --no-serve [Do not start the query engine]
```

_See code: [src/commands/scan.ts](https://github.com/cloudgraphdev/cli/blob/v0.7.4/src/commands/scan.ts)_

## `cg serve [PROVIDER]`

Serve a GraphQL query tool to query your CloudGraph data.

```
USAGE
  $ cg serve [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                    Set port to serve query engine
  -q, --query-engine=query-engine    Query engine to launch
  -s, --storage=storage              Select a storage engine to use. Currently only supports Dgraph
  --dev                              Turn on developer mode
  --directory=directory              Set the folder where CloudGraph will store data. (default cg)
  --no-serve                         Set to not serve a query engine

EXAMPLE
  $ cg serve
```

_See code: [src/commands/serve.ts](https://github.com/cloudgraphdev/cli/blob/v0.7.4/src/commands/serve.ts)_
<!-- commandsstop -->

# Query Tools

<!-- querytools -->

CloudGraph comes shipped with 2 great query tools and a GraphQL schema explorer. Remember, you can use **ANY** GraphQL query tool if you would prefer another option, just connect it to your exposed `/graphql` endpoint!

## [GraphQL Playground](https://github.com/graphql/graphql-playground)

GraphQL playground has a fluid and engaging UX that is great for querying a GraphQL schema quickly and simply. To access playground, either select it as your preferred query tool in the `init` command OR visit `/playground` in the server CG spins up.

## [Altair](https://github.com/altair-graphql/altair)

Altair is another great GraphQL query tool that packs a ton of [features](https://github.com/altair-graphql/altair#features) for power users. Do things like autocomplete queries, dynamically add fragments, and export/import collections of queries. To access Altair, either select it as your preferred query tool in the `init` command OR visit `/altair` in the server CG spins up.

## [Voyager](https://github.com/APIs-guru/graphql-voyager)

GraphQL Voyager is an awesome way to explore the schema(s) for your CG providers. It gives you a great bidirectional chart containing all your types and queries. You can click entities or arrows to discover connections, search for something specific, and get a deeper understanding of your schema. To access voyager, visit `/voyager` in the server CG spins up.

<!-- querytoolsstop -->
