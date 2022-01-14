import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class AddPolicy extends OperationBaseCommand {
  static description = 'Add new policy packs'

  static examples = [
    '$ cg policy add aws-cis-1.2.0',
    '$ cg policy add aws-cis-1.2.0@0.12.0',
  ]

  static strict = false

  static hidden = false

  async run(): Promise<void> {
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
  }
}
