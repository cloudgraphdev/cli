import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class ListProvider extends OperationBaseCommand {
  static description = 'List currently installed providers and versions'

  static aliases = ['ls:provider', 'list:provider']

  static examples = ['$ cg provider list', '$ cg provider list aws']

  static strict = false

  static hidden = false

  async run(): Promise<void> {
    try {
      await this.list(PluginType.Provider)
    } catch (error) {
      this.logger.debug(error)
    }
  }
}
