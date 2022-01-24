import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class ListPolicy extends OperationBaseCommand {
  static description = 'List currently installed policy packs and versions'

  static aliases = ['ls:policy', 'list:policy', 'ls:policy']

  static examples = ['$ cg policy list', '$ cg policy list aws']

  static strict = false

  static hidden = false

  async run(): Promise<void> {
    try {
      await this.list(PluginType.PolicyPack)
    } catch (error) {
      this.logger.debug(error)
    }
  }
}
