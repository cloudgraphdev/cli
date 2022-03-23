import { ConfiguredPlugin, PluginType } from '@cloudgraph/sdk'
import isEmpty from 'lodash/isEmpty'

import OperationBaseCommand from '../operation'

export default class RemovePolicy extends OperationBaseCommand {
  static description = 'Remove currently installed policy pack'

  static aliases = [
    'remove:policy',
    'policy:remove',
    'policy:rm',
    'del:policy',
    'rm:policy',
  ]

  static examples = [
    '$ cg policy remove',
    '$ cg policy remove aws-cis-1.2.0',
    '$ cg policy remove aws-cis-1.2.0 --no-save',
  ]

  static strict = false

  static hidden = false

  async run(): Promise<void> {
    try {
      const {
        manager,
        noSave = false,
        plugins: pluginsRemoved = [],
      } = await this.remove(PluginType.PolicyPack)

      for (const key of pluginsRemoved) {
        if (manager && !noSave) {
          manager.removeFromLockFile(key)

          const config = this.getCGConfig()
          if (config) {
            const configuredPolicies =
              config.cloudGraph.plugins?.[PluginType.PolicyPack] || []

            if (!isEmpty(configuredPolicies)) {
              // Remove policy from Policy Pack Plugin array
              config.cloudGraph.plugins[PluginType.PolicyPack] =
                configuredPolicies.filter(
                  (p: ConfiguredPlugin) => p.name !== key
                )

              this.saveCloudGraphConfigFile(config)
            }
          }
        }
      }
    } catch (error) {
      this.logger.stopSpinner()
    }
  }
}
