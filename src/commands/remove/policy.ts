import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class Remove extends OperationBaseCommand {
  static description = 'Remove currently installed policy pack'

  static examples = [
    '$ cg policy delete',
    '$ cg policy delete aws-cis-1.2.0',
    '$ cg policy delete aws-cis-1.2.0 --no-save',
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

          const [provider] = key.split('-')
          const config = this.getCGConfig()

          if (config[provider]) {
            config[provider].policies = [
              ...config[provider].policies.filter(
                (policy: string) => policy !== key
              ),
            ]
            this.saveCloudGraphConfigFile(config)
          }
        }
      }
    } catch (error) {
      this.logger.stopSpinner()
    }
  }
}
