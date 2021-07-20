import Command, {flags} from '@oclif/command'
import {Input} from '@oclif/parser'
import CloudGraph, {Logger} from 'cloud-graph-sdk'
import {cosmiconfigSync} from 'cosmiconfig'
import Manager from '../manager'
import EngineMap from '../storage'
import {StorageEngine} from '../storage/types'

const inquirer = require('inquirer')

export default abstract class BaseCommand extends Command {
  constructor(argv: any, config: any) {
    super(argv, config)
    this.logger = new CloudGraph.Logger(false)
    this.providers
  }

  interface = inquirer

  logger: Logger

  manager: Manager | undefined

  storageEngine: StorageEngine | undefined

  providers: {[key: string]: any} = {}

  static flags = {
    // debug flag
    debug: flags.boolean({env: 'DEBUG'}),
    // devMode flag
    dev: flags.boolean(),
    // dgraph host
    dgraph: flags.string({char: 'd'}),
    // storage engine to use
    storage: flags.string({char: 's', default: 'dgraph', env: 'DGRAPH_HOST'}),
  }

  static strict = false;

  static args = [{name: 'provider'}];

  async init(): Promise<void> {
    // Initialize the logger and storage engine
    const {flags: {debug, dev: devMode, storage}} = this.parse(this.constructor as Input<{debug: boolean; dev: boolean; storage: string}>)
    this.logger = new CloudGraph.Logger(debug)
    this.storageEngine = new EngineMap[storage]({host: this.getHost(), logger: this.logger})
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

  getHost(): string {
    const {flags: {dgraph: dgraphHost, storage}} = this.parse(this.constructor as Input<{debug: boolean; dev: boolean; dgraph: string; storage: string}>)
    // TODO: refactor this to handle multi storage solutions better
    if (storage === 'dgraph') {
      // first check for passed flag or env variable
      if (dgraphHost) {
        return dgraphHost
      }
      // next check for value defined in config file
      const config = this.getCGConfig('cloudGraph')
      if (config && config.dgraphHost) {
        return config.dgraphHost
      }
      // nothing found, return default location
      return 'http://localhost:8080'
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
      this.logger.log(error, {level: 'error'})
      this.logger.log(
        `There was an error installing or requiring a plugin for ${provider}, does one exist?`,
        {level: 'error'}
      )
      return null
    }
  }

  getCGConfig(provider?: string) {
    const config = cosmiconfigSync('cloud-graph').search()
    if (config) {
      const configResult = config.config
      if (provider) {
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
