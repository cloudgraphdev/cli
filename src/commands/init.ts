import { flags as CommandFlags } from '@oclif/command'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { fileUtils, getStorageEngineConnectionConfig } from '../utils'

import Command from './base'
import { CloudGraphConfig } from '../types'
import { StorageEngineConnectionConfig } from '../storage/types'
import {
  dGraphConfigQuestions,
  getProviderQuestion,
  overwriteQuestionPrompt,
  queryEngineConfigQuestions,
} from '../utils/questions'

export default class Init extends Command {
  static description = 'Set initial configuration for providers'

  static examples = [
    '$ cg init',
    '$ cg init aws [Initialize AWS provider]',
    '$ cg init aws -r [Specify resources to crawl]',
  ]

  static flags = {
    ...Command.flags,
    // select resources flag
    resources: CommandFlags.boolean({ char: 'r' }),
  }

  static hidden = false

  static strict = false

  static args = Command.args

  async getProvider(): Promise<string> {
    // TODO: remove when we have more choices
    const choices = ['aws']
    if (choices.length < 2) {
      return new Promise(resolve => resolve('aws'))
    }
    const { provider } = await this.interface.prompt(getProviderQuestion)
    this.logger.debug(provider)
    return provider
  }

  async promptForConfigOverwrite(
    category: string
  ): Promise<Record<string, boolean>> {
    return this.interface.prompt(overwriteQuestionPrompt(category))
  }

  /**
   * Searchs in the config object for the provider to see if its already been configured,
   * asks for config details if not found or if the user chooses to overwrite the existent config
   */
  async checkProviderConfig(provider: string, client: any): Promise<any> {
    const { flags } = this.parse(Init)
    const config = this.getCGConfig(provider)
    if (config) {
      this.logger.info(`Config for ${provider} already exists`)
      const { overwrite } = await this.promptForConfigOverwrite(`${provider}'s`)
      if (overwrite) {
        return client.configure(flags)
      }
      this.logger.warn(`Init command for ${provider} aborted`)
      return config
    }
    return client.configure(flags)
  }

  async askForDGraphConfig(overwrite = false): Promise<{
    versionLimit: string
    storageConfig: StorageEngineConnectionConfig
  }> {
    let {
      flags: { dgraph, 'version-limit': versionLimit = '10' },
    } = this.parse(Init)
    if (!dgraph && overwrite) {
      const { receivedUrl, vLimit } = await this.interface.prompt(
        dGraphConfigQuestions
      )
      dgraph = receivedUrl
      versionLimit = vLimit
    }
    this.logger.info(
      "Note that none of your cloud's information is ever sent to or stored by CloudGraph or third parties"
    )
    if (!overwrite) {
      return {
        storageConfig: this.getCGConfigKey('storageConfig'),
        versionLimit: this.getCGConfigKey('versionLimit'),
      }
    }
    return {
      storageConfig: getStorageEngineConnectionConfig(dgraph),
      versionLimit: versionLimit ?? '10',
    }
  }

  async askForQueryEngineConfig(overwrite = false): Promise<{
    queryEngine: string
    port: number | string
  }> {
    const {
      flags: { port = '5555' },
    } = this.parse(Init)
    let {
      flags: { 'query-engine': queryEngine },
    } = this.parse(Init)
    if (!queryEngine && overwrite) {
      const { inputQueryEngine } = await this.interface.prompt(
        queryEngineConfigQuestions
      )
      queryEngine = inputQueryEngine
    }
    if (!overwrite) {
      return {
        queryEngine: this.getCGConfigKey('queryEngine'),
        port: this.getCGConfigKey('port'),
      }
    }
    return { queryEngine: queryEngine ?? 'playground', port }
  }

  async getCloudGraphConfig(overwrite = false): Promise<CloudGraphConfig> {
    return {
      ...(await this.askForDGraphConfig(overwrite)),
      ...(await this.askForQueryEngineConfig(overwrite)),
    }
  }

  /**
   * Searchs in the config object for the CloudGraph config to see if is already configured,
   * asks for config details if not found or if the user chooses to overwrite the existent config
   */
  async fetchCloudGraphConfig(): Promise<void | CloudGraphConfig> {
    const cloudGraphConfig = this.getCGConfig('cloudGraph')
    if (cloudGraphConfig) {
      this.logger.info('CloudGraph config found...')
      const { overwrite } = await this.promptForConfigOverwrite('CloudGraph')
      return this.getCloudGraphConfig(overwrite)
    }
    return this.getCloudGraphConfig(true)
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

  async run(): Promise<void> {
    const { argv } = this.parse(Init)
    const { configDir, dataDir } = this.config
    // const opts: Opts = {logger: this.logger, debug, devMode}
    // First determine the provider if one has not been passed in args
    // if no provider is passed, they can select from a list of offically supported providers
    let allProviders: string[] = argv
    if (allProviders.length === 0) {
      allProviders = [await this.getProvider()]
    }
    const configResult: { [key: string]: Record<string, any> } = {}
    for (const provider of allProviders) {
      /**
       * setup base config for provider
       */
      configResult[provider] = {}
      /**
       * First install and require the provider plugin
       */
      const { client } = await this.getProviderClient(provider)
      if (!client) {
        this.logger.warn(
          `There was an issue initializing ${provider} plugin, skipping...`
        )
        continue // eslint-disable-line no-continue
      }
      configResult[provider] = await this.checkProviderConfig(provider, client)
      this.logger.debug(
        `${provider} provider config: ${JSON.stringify(configResult[provider])}`
      )
    }
    const cloudGraphConfig = await this.fetchCloudGraphConfig()
    if (cloudGraphConfig) {
      configResult.cloudGraph = cloudGraphConfig
    }
    this.saveCloudGraphConfigFile(configResult)
    this.logger.success(
      `Your config has been successfully stored at ${chalk.italic.green(
        path.join(configDir, '.cloud-graphrc.json')
      )}`
    )
    this.logger.success(
      `Your data will be stored at ${chalk.italic.green(
        path.join(dataDir, this.versionDirectory)
      )}`
    )
  }
}
