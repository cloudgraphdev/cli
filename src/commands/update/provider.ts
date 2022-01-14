import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class UpdateProvider extends OperationBaseCommand {
  static description = 'Update currently installed providers'

  static aliases = ['update:p']

  static examples = [
    '$ cg update provider',
    '$ cg update provider aws',
    '$ cg update provider aws@0.12.0',
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
