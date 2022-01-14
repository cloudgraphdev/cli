import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class InstallProvider extends OperationBaseCommand {
  static description = 'Install providers based on the lock file'

  static aliases = ['install']

  static examples = ['$ cg provider install']

  static strict = false

  static hidden = false

  async run(): Promise<void> {
    try {
      await this.installPlugin(PluginType.Provider)
    } catch (error) {
      this.logger.debug(error)
    }
  }
}
