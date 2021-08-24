import Command, { flags } from '@oclif/command'
import { Input } from '@oclif/parser'
import CloudGraph, { Logger } from '@cloudgraph/sdk'
import { cosmiconfigSync } from 'cosmiconfig'
import path from 'path'
import inquirer from 'inquirer'
import chalk from 'chalk'
import open from 'open'
import Manager from '../manager'
import EngineMap from '../storage'
import QueryEngine from '../server'
import { StorageEngine } from '../storage/types'
import { printWelcomeMessage } from '../utils'

export default abstract class BaseCommand extends Command {
  constructor(argv: any, config: any) {
    super(argv, config)
    this.logger = CloudGraph.logger
    this.providers = {}
  }

  interface = inquirer

  versionDirectory = 'cg'

  logger: Logger

  manager: Manager | undefined

  storageEngine: StorageEngine | undefined

  providers: { [key: string]: any }

  storedConfig: { [key: string]: any } | undefined

  static flags = {
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
    }),
    // dir to store cloud graph data versions in
    directory: flags.string({
      description:
        'Set the folder where CloudGraph will store data. (default cg)',
    }),
    // serve query engine after scan/load
    'no-serve': flags.boolean({
      default: false,
      description: 'Set to false to not serve a query engine',
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
    }),
  }

  static hidden = true

  static strict = false

  static args = [{ name: 'provider' }]

  async init(): Promise<void> {
    // Initialize the logger and storage engine
    const {
      flags: { storage = 'dgraph', directory },
    } = this.parse(
      this.constructor as Input<{
        dev: boolean
        storage: string
        directory: string
      }>
    )

    this.storageEngine = new EngineMap[storage]({
      host: this.getHost(),
      logger: this.logger,
    })
    const config = this.getCGConfig('cloudGraph')
    if (!config) {
      printWelcomeMessage()
    }
    const configDir = this.getCGConfigKey('directory') ?? 'cg'
    this.versionDirectory = directory ?? configDir
  }

  getCGConfigKey(key: string) {
    const config = this.getCGConfig('cloudGraph')
    if (config?.[key]) {
      return config[key]
    }
    return undefined
  }

  getStorageEngine(): StorageEngine {
    if (this.storageEngine) {
      return this.storageEngine
    }
    const {
      flags: { storage = 'dgraph' },
    } = this.parse(this.constructor as Input<{ dev: boolean; storage: string }>)
    const engine = new EngineMap[storage]({
      host: this.getHost(),
      logger: this.logger,
    })
    this.storageEngine = engine
    return engine
  }

  getQueryEngine(): string {
    const {
      flags: { 'query-engine': queryEngine },
    } = this.parse(this.constructor as Input<{ 'query-engine': string }>)
    const configEngine = this.getCGConfigKey('queryEngine') ?? 'playground'
    return queryEngine ?? configEngine
  }

  async startQueryEngine(): Promise<void> {
    const {
      flags: { port, 'no-serve': noServe },
    } = this.parse(
      this.constructor as Input<{ port: string; 'no-serve': string }>
    )
    if (!noServe) {
      const configPort = this.getCGConfigKey('port') ?? 5555
      const serverPort = port ?? configPort
      const queryEngine = new QueryEngine(serverPort)
      await queryEngine.startServer(this.getHost())
      this.logger.success(
        `Serving query engine at ${chalk.underline.green(
          `http://localhost:${serverPort}`
        )}`
      )
      await open(`http://localhost:${serverPort}/${this.getQueryEngine()}`, {
        wait: true,
      })
    }
  }

  getHost(showInitialStatus = true): string {
    const {
      flags: { dgraph: dgraphHost, storage },
    } = this.parse(
      this.constructor as Input<{
        dev: boolean
        dgraph: string
        storage: string
      }>
    )
    // TODO: refactor this to handle multi storage solutions better
    if (storage === 'dgraph') {
      // first check for passed flag or env variable
      if (dgraphHost) {
        showInitialStatus &&
          this.logger.info(`Dgraph host set as: ${dgraphHost}`)
        return dgraphHost
      }
      // next check for value defined in config file
      const config = this.getCGConfig('cloudGraph')
      if (config && config.dgraphHost) {
        showInitialStatus &&
          this.logger.info(`Dgraph host set as: ${config.dgraphHost}`)
        return config.dgraphHost
      }
      // nothing found, return default location
      const defaultHost = 'http://localhost:8997'
      showInitialStatus &&
        this.logger.info(`Dgraph host set as: ${defaultHost}`)
      return defaultHost
    }
    return 'http://localhost:8997'
  }

  async getProviderClient(provider: string) {
    const {
      flags: { dev: devMode },
    } = this.parse(this.constructor as Input<{ dev: boolean }>)
    try {
      if (!this.manager) {
        this.manager = new Manager({ logger: this.logger, devMode })
      }
      if (this.providers[provider]) {
        return this.providers[provider]
      }
      const { default: Client } = await this.manager.getProviderPlugin(provider)
      const client = new Client({
        logger: this.logger,
        provider: this.getCGConfig(provider),
      })
      this.providers[provider] = client
      return client
    } catch (error: any) {
      this.logger.error(error)
      this.logger.warn(
        `There was an error installing or requiring a plugin for ${provider}, does one exist?`
      )
      return null
    }
  }

  getCGConfig(provider?: string) {
    const { configDir } = this.config
    if (this.storedConfig) {
      return provider ? this.storedConfig[provider] : this.storedConfig
    }
    try {
      const config = cosmiconfigSync('cloud-graph').load(path.join(configDir, '.cloud-graphrc.json'))
      if (config) {
        const configResult = config.config
        this.storedConfig = configResult
        if (provider) {
          this.logger.info(`Found config for ${provider}, using...`)
          return configResult[provider]
        }
        return configResult
      }
      return null
    } catch (error: any) {
      return null
    }
  }

  async catch(err: any) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return super.catch(err)
  }
}
