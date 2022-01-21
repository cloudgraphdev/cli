import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class AddPolicy extends OperationBaseCommand {
  static description = 'Add new policy packs'

  static aliases = ['add:pp']

  static examples = [
    '$ cg add policy aws-cis-1.2.0',
    '$ cg add policy aws-cis-1.2.0@0.12.0',
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
        if (config && config[provider]) {
          config[provider].policies = config[provider].policies
            ? [...new Set([...config[provider].policies, key])]
            : [key]
          this.saveCloudGraphConfigFile(config)
        }
      }
    } catch (error) {
      this.logger.debug(error)
    }
  }
}
