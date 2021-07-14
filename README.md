cloud-graph
===========

Scan cloud data and query it with GraphQL

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cloud-graph.svg)](https://npmjs.org/package/cloud-graph)
[![Downloads/week](https://img.shields.io/npm/dw/cloud-graph.svg)](https://npmjs.org/package/cloud-graph)
[![License](https://img.shields.io/npm/l/cloud-graph.svg)](https://github.com/autocloud/cloud-graph/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g cloud-graph
$ cloud-graph COMMAND
running command...
$ cloud-graph (-v|--version|version)
cloud-graph/0.0.1 darwin-x64 node-v14.15.0
$ cloud-graph --help [COMMAND]
USAGE
  $ cloud-graph COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`cloud-graph hello [FILE]`](#cloud-graph-hello-file)
* [`cloud-graph help [COMMAND]`](#cloud-graph-help-command)

## `cloud-graph hello [FILE]`

describe the command here

```
USAGE
  $ cloud-graph hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ cloud-graph hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/autocloud/cloud-graph/blob/v0.0.1/src/commands/hello.ts)_

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
<!-- commandsstop -->
