import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class InstallPolicy extends OperationBaseCommand {
  static description = 'Install policy packs based on the lock file'

  static examples = ['$ cg policy install']

  static strict = false

  static hidden = false

  async run(): Promise<void> {
    await this.installPlugin(PluginType.PolicyPack)
  }
}
