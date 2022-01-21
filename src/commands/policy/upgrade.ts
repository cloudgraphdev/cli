import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class UpgradePolicy extends OperationBaseCommand {
  static description = 'Upgrade currently installed policy packs'

  static aliases = ['update:pp']

  static examples = [
    '$ cg upgrade policy',
    '$ cg upgrade policy aws-cis-1.2.0',
    '$ cg upgrade policy aws-cis-1.2.0@0.12.0',
  ]

  static strict = false

  static hidden = false

  async run(): Promise<void> {
    try {
      await this.update(PluginType.PolicyPack)
    } catch (error) {
      this.logger.stopSpinner()
      this.logger.debug(error)
    }
  }
}
