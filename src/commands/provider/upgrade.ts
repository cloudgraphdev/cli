import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class UpgradeProvider extends OperationBaseCommand {
  static description = 'Upgrade currently installed providers'

  static aliases = []

  static examples = [
    '$ cg upgrade provider',
    '$ cg upgrade provider aws',
    '$ cg upgrade provider aws@0.12.0',
  ]

  static strict = false

  static hidden = false

  async run(): Promise<void> {
    try {
      await this.update(PluginType.Provider)
    } catch (error) {
      this.logger.stopSpinner()
      this.logger.debug(error)
    }
  }
}
