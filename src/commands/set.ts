import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { fileUtils } from '../utils'

import Command from './base'
import { CloudGraphConfig } from '../types'
import { getProviderQuestion } from '../utils/questions'
import { DEFAULT_CG_CONFIG } from '../utils/constants'

export default class SetField extends Command {
  static description = 'Configure cloud provider service properties'

  static examples = ['$ cg set', '$ cg set aws [Initialize AWS provider]']

  static flags = {
    ...Command.flags,
  }

  static hidden = false

  static strict = false

  static args = Command.args

  async getProvider(): Promise<string> {
    const { provider } = await this.interface.prompt(getProviderQuestion)
    this.logger.debug(provider)
    return provider
  }

  /**
   * Ensures that the configuration path exists and saves the CloudGraph json config file in it
   */
  saveCloudGraphConfigFile(configResult: CloudGraphConfig): void {
    const { configDir } = this.config
    const previousConfig = this.getCGConfig()
    const newConfig = configResult
    if (previousConfig) {
      for (const key of Object.keys(previousConfig)) {
        if (!configResult[key]) {
          newConfig[key] = previousConfig[key]
        }
      }
    } else {
      fileUtils.makeDirIfNotExists(configDir)
    }
    fs.writeFileSync(
      path.join(configDir, '.cloud-graphrc.json'),
      JSON.stringify(newConfig, null, 2)
    )
  }

  async run(): Promise<void> {
    const { configDir } = this.config
    const { argv } = await this.parse(SetField)
    const config = this.getCGConfig() ?? DEFAULT_CG_CONFIG

    // First determine the provider if one has not been passed in args
    // if no provider is passed, they can select from a list of offically supported providers
    let allProviders: string[] = argv
    if (allProviders.length === 0) {
      allProviders = [await this.getProvider()]
    }
    const configResult: { [key: string]: Record<string, any> } = { ...config }
    for (const provider of allProviders) {
      /**
       * First install and require the provider plugin
       */
      const { services, serviceProperties } = await this.getProviderClient(
        provider
      )

      if (!serviceProperties) {
        this.logger.warn(
          "Provider's Properties should be defined to configure services"
        )
        continue // eslint-disable-line no-continue
      }

      const { resources: resourcesAnswer } = await this.interface.prompt([
        {
          type: 'checkbox',
          message: 'Select services to configure',
          loop: false,
          name: 'resources',
          choices: Object.values(services as { [key: string]: string }).map(
            (service: string) => ({
              name: service,
            })
          ),
        },
      ])
      const properties: { [field: string]: any } = {}
      for (const resource of resourcesAnswer) {
        const resourceProperties = serviceProperties[resource].map(
          ({ field, defaultValue }) => ({
            type: 'input',
            message: `set ${resource} ${field}`,
            name: field,
            default: defaultValue ?? undefined,
          })
        )
        properties[resource] = await this.interface.prompt(resourceProperties)
      }

      configResult[provider] = {
        ...configResult[provider],
        properties,
      }
    }

    this.saveCloudGraphConfigFile(configResult)
    this.logger.success(
      `Your config has been successfully stored at ${chalk.italic.green(
        path.join(configDir, '.cloud-graphrc.json')
      )}`
    )
  }
}
