import { Command, Interfaces } from '@oclif/core'
import CloudGraph, {
  Logger,
  StorageEngine,
  StorageEngineConnectionConfig,
  PluginType,
  SchemaMap,
} from '@cloudgraph/sdk'
import { cosmiconfigSync } from 'cosmiconfig'
import chalk from 'chalk'
import fs from 'fs'
import inquirer from 'inquirer'
import path from 'path'
import gt from 'semver/functions/gt'
import Manager from '../manager'
import EngineMap from '../storage'
import QueryEngine from '../server'
import {
  getDefaultEndpoint,
  getDefaultStorageEngineConnectionConfig,
  getStorageEngineConnectionConfig,
  printWelcomeMessage,
  printBoxMessage,
  fileUtils,
  getNextPort,
} from '../utils'
import flagsDefinition from '../utils/flags'
import openBrowser from '../utils/open'
import { CloudGraphConfig } from '../types'

export default abstract class BaseCommand extends Command {
  constructor(argv: any, config: any) {
    super(argv, config)
    this.logger = CloudGraph.logger
    this.providers = {}
    this.policyPacks = {}
  }

  interface = inquirer

  versionDirectory = 'cg'

  versionLimit = 10

  logger: Logger

  manager: Manager | undefined

  storageEngine: StorageEngine | undefined

  providers: { [key: string]: any }

  policyPacks: {
    [key: string]: any
  }

  storedConfig: { [key: string]: any } | undefined

  static flags: any = flagsDefinition

  static hidden = true

  static strict = false

  static args = [{ name: 'provider' }]

  async init(): Promise<void> {
    // Initialize the logger and storage engine
    const {
      flags: { storage = 'dgraph', directory },
    } = await this.parse(
      this.constructor as Interfaces.Input<{
        dev: boolean
        storage: string
        directory: string
      }>
    )
    this.storageEngine = new EngineMap[storage]({
      type: storage,
      ...(await this.getConnectionSettings()),
      logger: this.logger,
    })
    const config = this.getCGConfig('cloudGraph')
    if (!config) {
      printWelcomeMessage()
    }
    const manager = await this.getPluginManager(PluginType.Provider)
    const cliLatestVersion = await manager.queryRemoteVersion('@cloudgraph/cli')
    if (gt(cliLatestVersion, this.config.version)) {
      printBoxMessage(`Update for ${chalk.italic.green(
        '@cloudgraph/cli'
      )} is available: ${this.config.version} -> ${cliLatestVersion}. \n
Run ${chalk.italic.green('npm i -g @cloudgraph/cli')} to install`)
    }
    const configDir = this.getCGConfigKey('directory') ?? 'cg'
    this.versionDirectory = directory ?? configDir
    this.versionLimit = this.getCGConfigKey('versionLimit') ?? this.versionLimit
  }

  getCGConfigKey(key: string): any {
    const config = this.getCGConfig('cloudGraph')
    if (config?.[key]) {
      return config[key]
    }
    return undefined
  }

  async getStorageEngine(): Promise<StorageEngine> {
    if (this.storageEngine) {
      return this.storageEngine
    }
    const {
      flags: { storage = 'dgraph' },
    } = await this.parse(
      this.constructor as Interfaces.Input<{ dev: boolean; storage: string }>
    )
    const engine = new EngineMap[storage]({
      type: storage,
      ...(await this.getConnectionSettings()),
      logger: this.logger,
    })
    this.storageEngine = engine
    return engine
  }

  async getQueryEngine(): Promise<string> {
    const {
      flags: { 'query-engine': queryEngine },
    } = await this.parse(
      this.constructor as Interfaces.Input<{ 'query-engine': string }>
    )
    const configEngine = this.getCGConfigKey('queryEngine') ?? 'playground'
    return queryEngine ?? configEngine
  }

  async startQueryEngine(): Promise<void> {
    const {
      flags: { port, 'no-serve': noServe },
    } = await this.parse(
      this.constructor as Interfaces.Input<{ port: string; 'no-serve': string }>
    )
    if (!noServe) {
      const configPort = this.getCGConfigKey('port') ?? 5555
      const serverPort = port ?? configPort
      const availablePort = await getNextPort(Number(serverPort))
      if (serverPort !== availablePort) {
        this.logger.warn(
          `Requested port ${serverPort} is unavailable, using ${availablePort}`
        )
      }
      const queryEngine = new QueryEngine(availablePort)
      await queryEngine.startServer(
        this.getHost(await this.getConnectionSettings())
      )
      this.logger.success(
        `Serving query engine at ${chalk.underline.green(
          `http://localhost:${availablePort}`
        )}`
      )
      try {
        await openBrowser(
          `http://localhost:${availablePort}/${await this.getQueryEngine()}`
        )
      } catch (error) {
        this.logger.warn(
          `Could not open a browser tab with query engine, open manually at http://localhost:${availablePort}`
        )
      }
    }
  }

  async getConnectionSettings(
    showInitialStatus = true
  ): Promise<StorageEngineConnectionConfig> {
    const {
      flags: { dgraph: dgraphHost, storage = 'dgraph' },
    } = await this.parse(
      this.constructor as Interfaces.Input<{
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
        return getStorageEngineConnectionConfig(dgraphHost)
      }
      // next check for value defined in config file
      const config = this.getCGConfig('cloudGraph')
      if (config && config.storageConfig) {
        showInitialStatus &&
          this.logger.info(
            `Dgraph host set as: ${this.getHost(config.storageConfig)}`
          )
        return config.storageConfig
      }
      // nothing found, return default location

      showInitialStatus &&
        this.logger.info(`Dgraph host set as: ${getDefaultEndpoint()}`)
      return getDefaultStorageEngineConnectionConfig()
    }
    return getDefaultStorageEngineConnectionConfig()
  }

  getHost(config: StorageEngineConnectionConfig): string {
    return `${config.scheme}://${config.host}:${config.port}`
  }

  async getPluginManager(pluginType: PluginType): Promise<Manager> {
    const {
      flags: { dev: devMode },
    } = await this.parse(this.constructor as Interfaces.Input<{ dev: boolean }>)

    this.manager = new Manager({
      logger: this.logger,
      devMode,
      cliConfig: this.config,
      pluginType,
    })

    return this.manager
  }

  async getProviderClient(
    provider: string
  ): Promise<{ client: any; schemasMap?: SchemaMap; serviceKey?: string }> {
    try {
      const manager = await this.getPluginManager(PluginType.Provider)
      if (this.providers[provider]) {
        return this.providers[provider]
      }
      const {
        default: Client,
        enums: { schemasMap },
        serviceKey,
      } = (await manager.getPlugin(provider)) ?? {}
      if (!Client || !(Client instanceof Function)) {
        // TODO: how can we better type this for the base Provider class from sdk
        throw new Error(
          `The provider ${provider} did not return a valid Client instance`
        )
      }
      const client = new Client({
        logger: this.logger,
        provider: await this.buildProviderConfig(provider),
      })
      this.providers[provider] = { client, schemasMap, serviceKey }
      return { client, schemasMap, serviceKey }
    } catch (error: any) {
      this.logger.error(error)
      this.logger.warn(
        `There was an error installing or requiring a plugin for ${provider}, does one exist?`
      )
      this.logger.info(
        'For more information on this error, please see https://github.com/cloudgraphdev/cli#common-errors'
      )
      return { client: null }
    }
  }

  async getPolicyPackPackage({
    policyPack,
  }: {
    policyPack: string
  }): Promise<any> {
    try {
      const manager = await this.getPluginManager(PluginType.PolicyPack)
      if (this.policyPacks[policyPack]) {
        return this.policyPacks[policyPack]
      }

      const {
        default: { rules },
      } = (await manager.getPlugin(policyPack)) ?? {}

      if (!rules) {
        throw new Error(
          `The policy pack ${policyPack} did not return a valid set of rules`
        )
      }

      this.policyPacks[policyPack] = rules
      return rules
    } catch (error: any) {
      this.logger.error(error)
      this.logger.warn(
        `There was an error installing or requiring a plugin for ${policyPack}, does one exist?`
      )
      this.logger.info(
        'For more information on this error, please see https://github.com/cloudgraphdev/cli#common-errors'
      )
      return null
    }
  }

  getCGConfig(provider?: string): any {
    const { configDir } = this.config
    if (this.storedConfig) {
      return provider ? this.storedConfig[provider] : this.storedConfig
    }
    try {
      const config = cosmiconfigSync('cloud-graph').load(
        path.join(configDir, '.cloud-graphrc.json')
      )
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

  async buildProviderConfig(provider: string): Promise<any> {
    const { flags } = await this.parse(
      this.constructor as Interfaces.Input<any>
    )
    const providerConfig = this.getCGConfig(provider) ?? {}
    return {
      ...providerConfig,
      flags,
      cloudGraphConfig: this.getCGConfig('cloudGraph'),
    }
  }

  /**
   * Ensures that the configuration path exists and saves the CloudGraph json config file in it
   */
  saveCloudGraphConfigFile(configResult: CloudGraphConfig): void {
    const { configDir } = this.config
    fileUtils.makeDirIfNotExists(configDir)
    fs.writeFileSync(
      path.join(configDir, '.cloud-graphrc.json'),
      JSON.stringify(configResult, null, 2)
    )
  }

  async catch(err: any): Promise<any> {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return super.catch(err)
  }

  getLockFile(): any {
    const lockPath = path.join(this.config.configDir, '.cloud-graph.lock.json')
    try {
      const lockFile = cosmiconfigSync('cloud-graph').load(lockPath)
      return lockFile?.config ?? {}
    } catch (error: any) {
      this.logger.info('No lock file found for Cloud Graph')
      this.logger.debug(error)
      return {}
    }
  }
}
