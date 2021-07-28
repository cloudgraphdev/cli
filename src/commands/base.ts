import Command, {flags} from '@oclif/command'
import {Input} from '@oclif/parser'
import CloudGraph, {Logger} from 'cloud-graph-sdk'
import {cosmiconfigSync} from 'cosmiconfig'
import Manager from '../manager'
import EngineMap from '../storage'
import {StorageEngine} from '../storage/types'
import {printWelcomeMessage} from '../utils'

const inquirer = require('inquirer')

export default abstract class BaseCommand extends Command {
  constructor(argv: any, config: any) {
    super(argv, config)
    this.logger = CloudGraph.logger
    this.providers
  }

  interface = inquirer

  versionDirectory = 'cg'

  logger: Logger

  manager: Manager | undefined

  storageEngine: StorageEngine | undefined

  providers: {[key: string]: any} = {}

  storedConfig: {[key: string]: any} | undefined

  static flags = {
    // debug flag
    debug: flags.boolean({env: 'DEBUG'}),
    // devMode flag
    dev: flags.boolean(),
    // dgraph host
    dgraph: flags.string({char: 'd'}),
    // storage engine to use
    storage: flags.string({char: 's', default: 'dgraph', env: 'DGRAPH_HOST'}),
    // dir to store cloud graph data versions in
    directory: flags.string(),
  }

  static strict = false;

  static args = [{name: 'provider'}];

  async init(): Promise<void> {
    // Initialize the logger and storage engine
    const {flags: {debug, dev: devMode, storage, directory}} = this.parse(this.constructor as Input<{debug: boolean; dev: boolean; storage: string; directory: string}>)
    // this.logger = new CloudGraph.Logger(debug)
    this.storageEngine = new EngineMap[storage]({host: this.getHost(), logger: this.logger})
    const config = this.getCGConfig('cloudGraph')
    if (!config) {
      printWelcomeMessage()
    }
    if (config && config.directory) {
      this.versionDirectory = config.directory
    }
    if (directory) {
      this.versionDirectory = directory
    }
  }

  getStorageEngine(): StorageEngine {
    if (this.storageEngine) {
      return this.storageEngine
    }
    const {flags: {debug, dev: devMode, storage}} = this.parse(this.constructor as Input<{debug: boolean; dev: boolean; storage: string}>)
    const engine = new EngineMap[storage]({host: this.getHost(), logger: this.logger})
    this.storageEngine = engine
    return engine
  }

  getHost(showInitialStatus = true): string {
    const {flags: {dgraph: dgraphHost, storage}} = this.parse(this.constructor as Input<{debug: boolean; dev: boolean; dgraph: string; storage: string}>)
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
      const defaultHost = 'http://localhost:8080'
      showInitialStatus &&
        this.logger.info(`Dgraph host set as: ${defaultHost}`)
      return defaultHost
    }
    return 'http://localhost:8080'
  }

  async getProviderClient(provider: string) {
    const {flags: {dev: devMode}} = this.parse(this.constructor as Input<{debug: boolean; dev: boolean}>)
    try {
      if (!this.manager) {
        this.manager = new Manager({logger: this.logger, devMode})
      }
      if (this.providers[provider]) {
        return this.providers[provider]
      }
      const {default: Client} = await this.manager.getProviderPlugin(provider)
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
    if (this.storedConfig) {
      return provider ? this.storedConfig[provider] : this.storedConfig
    }
    const config = cosmiconfigSync('cloud-graph').search()
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
  }

  async catch(err) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return super.catch(err)
  }
}
