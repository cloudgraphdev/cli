import chalk from 'chalk'
import { PluginType } from '../../utils/constants'
import Command from '../base'

export default class Add extends Command {
  static description = 'Add new providers'

  static aliases = ['add']

  static examples = ['$ cg provider add aws', '$ cg provider add aws@0.12.0']

  static strict = false

  static hidden = false

  static flags = {
    ...Command.flags,
  }

  static args = Command.args

  async run(): Promise<void> {
    const { argv } = this.parse(Add)
    const allProviders = argv
    const manager = this.getPluginManager(PluginType.Provider)
    for (let key of allProviders) {
      let version = 'latest'
      if (key.includes('@')) {
        [key, version] = key.split('@')
      }
      await manager.getPlugin(key, version)
      this.logger.info(
        `Run ${chalk.italic.green(
          `$cg init ${key}`
        )} to setup configuration for this provider`
      )
    }
  }
}
