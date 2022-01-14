import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class UpdatePolicy extends OperationBaseCommand {
  static description = 'Update currently installed policy packs'

  static aliases = []

  static examples = [
    '$ cg policy update',
    '$ cg policy update aws-cis-1.2.0',
    '$ cg policy update aws-cis-1.2.0@0.12.0',
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
