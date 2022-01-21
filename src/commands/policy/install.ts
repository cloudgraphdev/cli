import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class InstallPolicy extends OperationBaseCommand {
  static description = 'Install policy packs based on the lock file'

  static aliases = ['install:pp']

  static examples = ['$ cg install policy']

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
