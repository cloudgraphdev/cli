/* eslint-disable no-console */
import Command from './base'

export default class Serve extends Command {
  static description = 'Serve a GraphQL query tool to query your CloudGraph data.';

  static examples = [
    '$ cg serve',
  ];

  static strict = false

  static hidden = false

  static flags = {
    ...Command.flags,
  };

  static args = Command.args

  async run(): Promise<void> {
    const storageEngine = await this.getStorageEngine()
    const storageRunning = await storageEngine.healthCheck()
    if (!storageRunning) {
      const msg = `Storage engine check at ${storageEngine.host} FAILED canceling SERVE`
      this.logger.error(msg)
      throw new Error(msg)
    }
    await this.startQueryEngine()
  }
}
