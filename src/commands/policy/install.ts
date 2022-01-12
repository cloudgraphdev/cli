import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class InstallPolicy extends OperationBaseCommand {
  static description = 'Install policy packs based on the lock file'

  static aliases = ['install:policy']

  static examples = ['$ cg policy install']

  static strict = false

  static hidden = false

  async run(): Promise<void> {
    try {
      await this.installPlugin(PluginType.PolicyPack)
    } catch (error) {
      this.logger.debug(error)
    }
  }
}