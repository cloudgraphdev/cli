import { flags } from '@oclif/command'

export default {
  // devMode flag
  dev: flags.boolean({ description: 'Turn on developer mode' }),
  // dgraph host
  dgraph: flags.string({
    char: 'd',
    env: 'CG_HOST_PORT',
    description: 'Set where dgraph is running (default localhost:8997)',
  }),
  // storage engine to use
  storage: flags.string({
    char: 's',
    description:
      'Select a storage engine to use. Currently only supports Dgraph',
    options: ['dgraph'],
  }),
  // dir to store cloud graph data versions in
  directory: flags.string({
    description:
      'Set the folder where CloudGraph will store data. (default cg)',
  }),
  // serve query engine after scan/load
  'no-serve': flags.boolean({
    default: false,
    description: 'Set to not serve a query engine',
  }),
  // port for query engine
  port: flags.integer({
    char: 'p',
    env: 'CG_QUERY_PORT',
    description: 'Set port to serve query engine',
  }),
  // Query Engine to use
  'query-engine': flags.string({
    char: 'q',
    description: 'Query engine to launch',
    options: ['playground', 'altair'],
  }),
  // version limit
  'version-limit': flags.string({
    char: 'l',
    description:
      'Limit the amount of version folders stored on the filesystem (default 10)',
  }),
  // use roles flag (AWS only)
  'use-roles': flags.boolean({
    default: false,
    description:
      'Set to true to use roleARNs instead of profiles for AWS credentials',
  }),
  // Policy packs to use
  policies: flags.string({
    char: 'P',
    description: 'Policy Packs to execute during scan',
  }),
}
