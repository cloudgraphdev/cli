/* eslint-disable no-console */
import {flags} from '@oclif/command'
import axios from 'axios'
import {Opts} from 'cloud-graph-sdk'

import Command from './base'
import {fileUtils} from '../utils'

const chalk = require('chalk')
const ora = require('ora')
const {exec} = require('child_process')

export default class Launch extends Command {
  static description = 'Scan provider data based on your config';

  static examples = [
    `$ cloud-graph scan aws
Lets scan your AWS resources!
`,
  ];

  static strict = false;

  static flags = {
    ...Command.flags,
  };

  static args = Command.args

  execCommand(cmd: string) {
    return new Promise((resolve, reject) => {
      exec(cmd, (error: any, stdout: any, stderr: any) => {
        if (error) {
          reject(error)
        }
        resolve(stdout ? stdout : stderr)
      })
    })
  }

  // TODO: convert this func to handle any storage provider
  async run() {
    const {flags: {debug, dev: devMode}} = this.parse(Launch)
    const dgraphHost = this.getHost()
    // TODO: not a huge fan of this pattern, rework how to do debug and devmode tasks (specifically how to use in providers)
    // const opts: Opts = {logger: this.logger, debug, devMode}
    const dockerCheck = ora('checking for Docker').start()
    try {
      await this.execCommand('docker -v')
      dockerCheck.succeed('Docker found')
    } catch (error: any) {
      dockerCheck.fail('It appears Docker is not installed, please install it at: https://docs.docker.com/get-docker/', {level: 'error'})
      this.logger.error(error)
      this.exit()
    }
    const dgraphImgCheck = ora('pulling Dgraph Docker image').start()
    try {
      fileUtils.makeDirIfNotExists(`${process.cwd()}/dgraph`)
      await this.execCommand('docker pull dgraph/standalone')
      dgraphImgCheck.succeed('Pulled Dgraph Docker image')
    } catch (error: any) {
      dgraphImgCheck.fail('Failed pulling Dgraph Docker image please check your docker installation', {level: 'error'})
      this.logger.error(error)
      this.exit()
    }
    const dgraphInit = ora('Spinning up new Dgraph instance').start()
    try {
      await this.execCommand(`docker run -d -p 5080:5080 -p 6080:6080 -p 8080:8080 -p 9080:9080 -p 8000:8000 -v ${process.cwd()}/dgraph:/dgraph --name dgraph dgraph/standalone:v21.03.0`)
    } catch (error: any) {
      dgraphInit.fail('Failed starting Dgraph instance')
      this.logger.error(error)
      this.exit()
    }

    // TODO: smaller sleep time and exponential backoff for ~5 tries
    await new Promise(resolve => setTimeout(resolve, 10000))
    try {
      await axios({
        url: `${dgraphHost}/health?all`,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      dgraphInit.succeed('Dgraph instance running')
    } catch (error: any) {
      dgraphInit.fail('Failed starting Dgraph instance')
      this.logger.debug(error)
    }
    this.logger.success(`Access your dgraph instance at ${chalk.underline.green(dgraphHost)}`)
    this.logger.info(`For more information on dgraph, see the dgrah docs at: ${chalk.underline.green('https://dgraph.io/docs/graphql/')}`)
    this.exit()
  }
}
