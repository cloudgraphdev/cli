import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class UpgradeProvider extends OperationBaseCommand {
  static description = 'Upgrade currently installed providers'

  static aliases = []

  static examples = [
    '$ cg provider update',
    '$ cg provider update aws',
    '$ cg provider update aws@0.12.0',
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
