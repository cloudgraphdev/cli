import Command from '../base'

export default class Add extends Command {
  static description =
    'Commands to manage provider modules, run $ cg provider for more info.'

  static strict = false

  static hidden = false

  static flags = {
    ...Command.flags,
  }

  static args = Command.args

  async run(): Promise<void> {
    this.logger.info('cg provider is a topic not a command')
  }
}
