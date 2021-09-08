/* eslint-disable no-console */
import Command from '../base'

export default class Add extends Command {
  static description = 'Add new providers'

  static aliases = ['add']

  static examples = [
    '$ cg provider add aws',
    '$ cg provider add aws@0.12.0'
  ]

  static strict = false

  static hidden = false

  static flags = {
    ...Command.flags,
  };

  static args = Command.args

  async run(): Promise<void> {
    const {
      argv
    } = this.parse(Add)
    const allProviders = argv
    const manager = this.getPluginManager()
    for (let key of allProviders) {
      let version = 'latest'
      if (key.indexOf('@') > -1) {
        [key, version] = key.split('@')
      }
      await manager.getProviderPlugin(key, version)
    }
  }
}
