import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class AddProvider extends OperationBaseCommand {
  static description = 'Add new providers'

  static aliases = ['add']

  static examples = ['$ cg add provider aws', '$ cg add provider aws@0.12.0']

  static strict = false

  static hidden = false

  async run(): Promise<void> {
    try {
      await this.add(PluginType.Provider)
    } catch (error) {
      this.logger.debug(error)
    }
  }
}
