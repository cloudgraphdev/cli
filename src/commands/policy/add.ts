// import chalk from 'chalk'
import Command from '../base'

export default class Add extends Command {
  static description = 'Add new policy packs'

  static aliases = ['add']

  static examples = ['$ cg policy add aws', '$ cg policy add aws@0.12.0']

  static strict = false

  static hidden = false

  static flags = {
    ...Command.flags,
  }

  static args = Command.args

  async run(): Promise<void> {
    // const {
    //   argv
    // } = this.parse(Add)
    // const allProviders = argv
    // const manager = this.getPluginManager()
    // for (let key of allProviders) {
    //   let version = 'latest'
    //   if (key.includes('@')) {
    //     [key, version] = key.split('@')
    //   }
    //   await manager.getProviderPlugin(key, version)
    //   this.logger.info(
    //     `Run ${chalk.italic.green(
    //       `$cg init ${key}`
    //     )} to setup configuration for this provider`)
    // }
  }
}
