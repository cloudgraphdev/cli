/* eslint-disable no-console */
import {flags} from '@oclif/command'
import {Opts} from 'cloud-graph-sdk'

import Command from './base'
import {printWelcomeMessage} from '../utils'

const fs = require('fs')
const path = require('path')
const ora = require('ora')

export default class Init extends Command {
  static description =
    'Initialize your config to being scanning your cloud infrastructure';

  static examples = [
    `$ cloud-graph init
Hi from AutoCloud! Lets setup your config
`,
  ];

  static flags = {
    ...Command.flags,
    // select resources flag
    resources: flags.boolean({char: 'r'}),
  };

  static strict = false;

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

  async getNewProviderConfig(provider: string): Promise<{[key: string]: string}> {
    const {
      flags: {resources},
    } = this.parse(Init)
    const result: {[key: string]: string} = {}
    const {properties: {regions, services}} = await this.getProviderClient(provider)
    // Only query for regions if this provider has a list of them
    if (regions) {
      const answers = await this.interface.prompt([
        {
          type: 'checkbox',
          message: 'Select regions to scan',
          loop: false,
          name: 'regions',
          choices: regions.map((region: string) => ({
            name: region,
          })),
        },
      ])
      this.logger.debug(answers)
      result.regions = answers.regions.join(',')
      // eslint-disable-next-line max-depth
    }
    // Only query for resorces if the flag is set, otherwise take them all.
    if (resources) {
      const answers = await this.interface.prompt([
        {
          type: 'checkbox',
          message: 'Select services to scan',
          loop: false,
          name: 'resources',
          choices: Object.values(services as {[key: string]: string}).map(
            (service: string) => ({
              name: service,
            })
          ),
        },
      ])
      this.logger.debug(answers)
      if (answers.resources.length > 0) {
        result.resources = answers.resources.join(',')
      } else {
        result.resources = Object.values(
          services
        ).join(',')
      }
    } else {
      result.resources = Object.values(
        services
      ).join(',')
    }
    return result
  }

  async getCloudGraphConfig() {
    const {
      flags: {dgraph},
    } = this.parse(Init)
    const result: {[key: string]: any} = {}
    if (dgraph) {
      result.dgraphHost = dgraph
    } else {
      const {dgraph} = await this.interface.prompt([
        // TODO: validate has url structure with regex
        {
          type: 'input',
          message: 'Enter your dgraph host url (or launch dgraph with "cloud-graph launch")',
          name: 'dgraph',
          default: 'http://localhost:8080',
        },
      ])
      result.dgraphHost = dgraph
    }
    return result
  }

  async run() {
    if (!this.getCGConfig()) {
      printWelcomeMessage()
    }
    const {
      argv,
      flags: {debug, dev: devMode},
    } = this.parse(Init)
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
        this.logger.warn(`There was an issue initializing ${provider} plugin, skipping...`)
        continue
      }
      /**
       * Search in the config object for the provider to see if its already been configured
       */
      const config = this.getCGConfig(provider)
      if (config) {
        this.logger.info(`Config for ${provider} already exists`)
        const answers = await this.interface.prompt([
          {
            type: 'expand',
            message: `How would you like to change ${provider}'s config`,
            name: 'nextStep',
            choices: [
              {
                key: 'y',
                name: 'Overwrite',
                value: 'overwrite',
              },
              {
                key: 'x',
                name: 'Abort',
                value: 'abort',
              },
            ],
          },
        ])
        this.logger.debug(answers)
        if (answers.nextStep === 'overwrite') {
          configResult[provider] = await this.getNewProviderConfig(provider)
        } else {
          this.logger.warn(`Init command for ${provider} aborted`)
          this.exit()
        }
      } else {
        configResult[provider] = await this.getNewProviderConfig(provider)
        configResult.cloudGraph = await this.getCloudGraphConfig()
      }
    }
    fs.writeFileSync(
      path.join(process.cwd(), '.cloud-graphrc.json'),
      JSON.stringify(configResult, null, 2)
    )
    this.exit()
  }
}
