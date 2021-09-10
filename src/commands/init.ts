import { flags } from '@oclif/command'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import QueryEngine from '../server'
import { fileUtils, getStorageEngineConnectionConfig } from '../utils'

import Command from './base'
import { DEFAULT_CONFIG } from '../utils/constants'

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
    resources: flags.boolean({ char: 'r' }),
  }

  static hidden = false

  static strict = false

  static args = Command.args

  getProvider(): Promise<string> {
    // TODO: remove when we have more choices
    const choices = ['aws']
    if (choices.length < 2) {
      return new Promise(resolve => resolve('aws'))
    }
    return new Promise(resolve => {
      this.interface
        .prompt([
          {
            type: 'list',
            name: 'provider',
            message: 'Which cloud provider would you like to use?',
            choices: ['aws'],
          },
        ])
        .then((res: { provider: string }) => {
          this.logger.debug(res.provider)
          resolve(res.provider)
        })
    })
  }

  async getCloudGraphConfig(): Promise<{
    [key: string]: string | Record<string, unknown>
  }> {
    const {
      flags: { dgraph, 'query-engine': queryEngine },
    } = this.parse(Init)
    const result: { [key: string]: any } = {}
    if (dgraph) {
      result.dgraphHost = dgraph
    } else {
      const { fullUrl, versionLimit } = await this.interface.prompt([
        {
          type: 'input',
          message:
            'Input your dgraph host url, if you are unsure, use the default by pressing ENTER',
          name: 'fullUrl',
          default: `${DEFAULT_CONFIG.scheme}://${DEFAULT_CONFIG.host}:${DEFAULT_CONFIG.port}`,
        },
        {
          type: 'input',
          message:
            'Enter the maximum number of scanned versions of your cloud data that you would like to store',
          name: 'versionLimit',
          default: 10,
        },
      ])

      result.versionLimit = versionLimit

      result.storageConfig = getStorageEngineConnectionConfig(fullUrl)
    }
    if (queryEngine) {
      result.queryEngine = QueryEngine
    } else {
      const { inputQueryEngine } = await this.interface.prompt([
        {
          type: 'list',
          message: 'What tool would you like to query your data with?',
          name: 'inputQueryEngine',
          choices: [
            {
              name: 'GraphQL Playground (https://github.com/graphql/graphql-playground)',
              value: 'playground',
              short: 'GraphQL Playground',
            },
            {
              name: 'Altair GraphQL Client (https://altair.sirmuel.design/)',
              value: 'altair',
              short: 'Altair GraphQL Client',
            },
          ],
          default: 'playground',
        },
      ])
      result.queryEngine = inputQueryEngine
    }
    return result
  }

  async run(): Promise<any> {
    const { argv, flags } = this.parse(Init)
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
      const client = await this.getProviderClient(provider)
      if (!client) {
        this.logger.warn(
          `There was an issue initializing ${provider} plugin, skipping...`
        )
        continue // eslint-disable-line no-continue
      }
      /**
       * Search in the config object for the provider to see if its already been configured
       */
      const config = this.getCGConfig(provider)
      if (config) {
        this.logger.info(`Config for ${provider} already exists`)
        const answers = await this.interface.prompt([
          {
            type: 'confirm',
            message: `Would you like to change ${provider}'s config`,
            name: 'overwrite',
            default: true,
          },
        ])
        this.logger.debug(answers)
        if (answers.overwrite) {
          configResult[provider] = await client.configure(flags)
        } else {
          this.logger.warn(`Init command for ${provider} aborted`)
          configResult[provider] = config
        }
      } else {
        configResult[provider] = await client.configure(flags)
      }
    }
    const cloudGraphConfig = this.getCGConfig('cloudGraph')
    if (cloudGraphConfig) {
      this.logger.info('CloudGraph config found...')
      const answers = await this.interface.prompt([
        {
          type: 'confirm',
          message: 'Would you like to change CloudGraph config',
          name: 'overwrite',
          default: true,
        },
      ])
      this.logger.debug(answers)
      if (answers.overwrite) {
        configResult.cloudGraph = await this.getCloudGraphConfig()
      }
    } else {
      configResult.cloudGraph = await this.getCloudGraphConfig()
    }
    fileUtils.makeDirIfNotExists(configDir)
    fs.writeFileSync(
      path.join(configDir, '.cloud-graphrc.json'),
      JSON.stringify(configResult, null, 2)
    )
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
    this.exit()
  }
}
