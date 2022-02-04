import { PluginType } from '@cloudgraph/sdk'
import { isEmpty, uniqBy } from 'lodash'

import OperationBaseCommand from '../operation'

export default class AddPolicy extends OperationBaseCommand {
  static description = 'Add new policy packs'

  static aliases = ['add:policy']

  static examples = [
    '$ cg policy add aws-cis-1.2.0',
    '$ cg policy add aws-cis-1.2.0@0.12.0',
  ]

  static strict = false

  static hidden = false

  async run(): Promise<void> {
    try {
      const installedPolicies = await this.add(PluginType.PolicyPack)

      for (const installedPolicy of installedPolicies) {
        const {
          key,
          plugin: { default: { provider } } = { default: { provider: '' } },
        } = installedPolicy

        // Save policy to CG config file
        const config = this.getCGConfig()
        if (config) {
          let configuredPolicies =
            config.cloudGraph.plugins[PluginType.PolicyPack] || []

          if (isEmpty(configuredPolicies)) {
            // Set new Policy Pack Plugin array
            configuredPolicies = [
              {
                name: key,
                providers: [provider],
              },
            ]
          } else {
            // Add policy to Policy Pack Plugin array
            configuredPolicies = [
              ...configuredPolicies,
              {
                name: key,
                providers: [provider],
              },
            ]
          }
          config.cloudGraph.plugins[PluginType.PolicyPack] = uniqBy(
            configuredPolicies,
            'name'
          )
          this.saveCloudGraphConfigFile(config)
        }
      }
    } catch (error) {
      this.logger.debug(error)
    }
  }
}
