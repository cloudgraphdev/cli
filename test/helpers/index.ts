import { existsSync, rmdirSync, unlinkSync } from 'fs'
import * as path from 'path'
import CloudGraph from '@cloudgraph/sdk'
import Provider from '@cloudgraph/sdk/dist/client'
import oclifParse, { parse as oclifParser } from '@oclif/parser'
import { Config as ConfigCommandClass } from '@oclif/config'
import { Config } from 'cosmiconfig/dist/types'
import { cosmiconfigSync } from 'cosmiconfig'

import InitCommandClass from '../../src/commands/init'
import LaunchCommandClass from '../../src/commands/launch'
import ServeCommandClass from '../../src/commands/serve'
import {
  execCommand,
  fileUtils,
  findExistingDGraphContainerId,
} from '../../src/utils'
import { DGRAPH_CONTAINER_LABEL, DGRAPH_DOCKER_IMAGE_NAME } from '../../src/utils/constants'
import {
  configFileMock,
  rootDir as root,
  rootTestConfigDir,
  testConfigDir as configDir,
  testDataDir as dataDir,
  testDGraphDirectory,
  testQueryEngine,
  testQueryEnginePort,
  testStorageConfig,
} from './mocks'
import {
  MockInitCmdPromptExpectation,
  MockInitCmdFlagsExpectation,
  MockRunInitCmdPromptExpectation,
} from './types'

const ConfigCommand = new ConfigCommandClass({ root })
const LaunchCommand = new LaunchCommandClass([''], { root })
const ServeCommand = new ServeCommandClass([''], { root })

export const { logger } = CloudGraph

export const setConfigCommand = async (): Promise<{ version: string }> => {
  await ConfigCommand.load()
  const { version } = ConfigCommand
  ConfigCommand.configDir = configDir
  ConfigCommand.dataDir = dataDir
  return { version }
}

export const getInitCommand = async (
  argv: any = ['']
): Promise<InitCommandClass> => {
  const { version } = await setConfigCommand()
  const initCommand = new InitCommandClass(argv, { root })
  initCommand.config.configDir = configDir
  initCommand.config.dataDir = dataDir
  initCommand.config.version = version
  return initCommand
}

export const getServeCommand = async (
  argv: any = ['']
): Promise<ServeCommandClass> => {
  const { version } = await setConfigCommand()
  const serveCommand = new ServeCommandClass(argv, { root })
  serveCommand.config.configDir = configDir
  serveCommand.config.dataDir = dataDir
  serveCommand.config.version = version
  return serveCommand
}

export const removeTestDirs = (): void => {
  rmdirSync(rootTestConfigDir, { recursive: true })
  // rmdirSync(dataDir, { recursive: true })
}

export const getConfigFile = (debug = false): Config => {
  debug && logger.debug(`getting configDir: ${configDir}`)
  const file = cosmiconfigSync('cloud-graph').load(
    path.join(configDir, '.cloud-graphrc.json')
  )
  return file?.config
}

export const saveTestCloudGraphConfigFile = async (
  InitCommand: InitCommandClass,
  debug = false
): Promise<void> => {
  debug && logger.debug(`saving test config: ${configDir}`)
  InitCommand.saveCloudGraphConfigFile(configFileMock)
}

export const parseArgv = (
  InitClass: InitCommandClass
): oclifParse.Output<
  any,
  {
    [name: string]: string
  }
> => {
  return oclifParser(InitClass.argv, { context: this, ...InitClass.ctor })
}

export const flagTestHelper = async (
  flag: string,
  flagInput: string | number | undefined,
  debug = false
): Promise<void> => {
  debug && logger.debug('******')
  debug && logger.debug(`Flag '--${flag}' Test(helper)`)
  const flagInputConcatString = flagInput ? `=${flagInput}` : ''
  const flagEntry = `--${flag}${flagInputConcatString}`
  debug && logger.debug(`Full flag arg to test: '${flagEntry}'`)
  const Init = await getInitCommand([flagEntry])
  const { flags } = parseArgv(Init)
  debug && logger.debug(`Parsed result: ${flags[flag]}`)
  expect(flags[flag]).toBe(flagInput ?? true)
}

export const initCommandPromptGetterMethodTester = async (
  spyFn: jest.SpyInstance,
  mock: MockInitCmdPromptExpectation,
  debug = false
): Promise<void> => {
  debug && logger.debug('******')
  debug && logger.debug(`Test ${mock.methodToTest}`)
  debug && logger.debug(`overwriteFlag: ${JSON.stringify(mock.overwriteFlag)}`)
  debug &&
    logger.debug(`promptExpectation: ${JSON.stringify(mock.promptExpectation)}`)
  mock.promptExpectation.forEach(expectation =>
    spyFn.mockResolvedValueOnce(expectation)
  )
  const InitCommand = await getInitCommand([''])
  const cloudGraphConfig = InitCommand.getCGConfig('cloudGraph')
  debug &&
    logger.debug(
      `Config Dir -> ${JSON.stringify(InitCommand.config.configDir)}`
    )
  debug && logger.debug(`Config -> ${JSON.stringify(cloudGraphConfig)}`)
  const response = await InitCommand[mock.methodToTest](mock.overwriteFlag)
  debug && logger.debug(`response: ${JSON.stringify(response)}`)
  expect(response).toMatchObject(mock.expectedResult)
  debug &&
    logger.debug(`expectedResult: ${JSON.stringify(mock.expectedResult)}`)
}

export const initCommandNoOverwriteTester = async (
  mock: MockInitCmdPromptExpectation | MockInitCmdFlagsExpectation,
  debug = false
): Promise<void> => {
  debug && logger.debug('******')
  debug && logger.debug(`Test ${mock.methodToTest}`)
  const InitCommand = await getInitCommand([''])
  await saveTestCloudGraphConfigFile(InitCommand, debug)
  const response = await InitCommand[mock.methodToTest](mock.overwriteFlag)
  debug && logger.debug(`response: ${JSON.stringify(response)}`)
  expect(response).toMatchObject(mock.expectedResult)
  debug &&
    logger.debug(`expectedResult: ${JSON.stringify(mock.expectedResult)}`)
}

export const initCommandArgvGetterMethodTester = async (
  mock: MockInitCmdFlagsExpectation,
  debug = false
): Promise<void> => {
  debug && logger.debug('******')
  debug && logger.debug(`Test ${mock.methodToTest}`)
  debug && logger.debug(`argvList: ${JSON.stringify(mock.argvList)}`)
  const Init = await getInitCommand(mock.argvList)
  const response = await Init[mock.methodToTest](mock.overwriteFlag)
  debug && logger.debug(`response: ${JSON.stringify(response)}`)
  expect(response).toMatchObject(mock.expectedResult)
  debug &&
    logger.debug(`expectedResult: ${JSON.stringify(mock.expectedResult)}`)
}

export const removeConfigFile = (debug = false): void => {
  const filePath = path.join(configDir, '.cloud-graphrc.json')
  debug && logger.debug(`removing configFile: ${filePath}`)
  if (existsSync(filePath)) {
    unlinkSync(filePath)
  }
}

export const runInitCommandTester = async (
  spyFn: jest.SpyInstance,
  mock: MockRunInitCmdPromptExpectation,
  removeConfig = false,
  debug = false
): Promise<void> => {
  debug && logger.debug('******')
  debug && logger.debug('Test InitCommand.run()')
  debug && logger.debug(`argvList: ${JSON.stringify(mock.argvList)}`)
  const InitCommand = await getInitCommand(mock.argvList)
  if (removeConfig) {
    removeConfigFile(debug)
    // Mock inquirer prompt call in the provider plugin
    // TODO: Change mock structure after we add more providers
    const client: Provider = await InitCommand.getProviderClient(
      await InitCommand.getProvider()
    )
    const clientInterfaceSpy = jest.spyOn(client.interface, 'prompt')
    clientInterfaceSpy.mockResolvedValueOnce({ approved: true })
    clientInterfaceSpy.mockResolvedValueOnce({ regions: ['us-east-1'] })
    // remove all overwrite prompt mocks
    mock.promptExpectation = mock.promptExpectation.filter(
      i => !('overwrite' in i)
    )
  }
  debug && logger.debug(`mock: ${JSON.stringify(mock)}`)
  const originalConfigFile = !removeConfig ? getConfigFile(debug) : {}
  mock.promptExpectation.forEach(expectation =>
    spyFn.mockResolvedValueOnce(expectation)
  )
  await InitCommand.run()
  const newConfigFile = getConfigFile(debug)
  if (
    !mock.overwriteFlags.overwriteProviderConfig &&
    !mock.overwriteFlags.overwriteCloudGraphConfig
  ) {
    // Test config is unchanged
    expect(newConfigFile).toMatchObject(originalConfigFile)
  }
  if (
    !mock.overwriteFlags.overwriteProviderConfig &&
    mock.overwriteFlags.overwriteCloudGraphConfig
  ) {
    // Test config for cloudgraph configuration changes
    originalConfigFile.cloudGraph = mock.expectedResult
    expect(newConfigFile).toMatchObject(originalConfigFile)
  }
}

export const initTestSuite = (
  args: {
    libsToMock?: string[]
  } = {}
): void => {
  const { libsToMock } = args
  libsToMock?.forEach(lib => jest.mock(lib))
  jest.setTimeout(300000)
}

export const stopDgraphContainer = async (
  rmContainer = false
): Promise<void> => {
  try {
    let containerToRemove: undefined | string
    const runningContainerId = await findExistingDGraphContainerId('running')
    if (runningContainerId) {
      logger.debug(
        `Stopping ${rmContainer ? 'and deleting' : ''} ${runningContainerId}`
      )
      await execCommand(`docker stop ${runningContainerId}`)
      logger.debug(`${runningContainerId} stopped succesfully`)
      containerToRemove = runningContainerId
    } else {
      const exitedContainerId = await findExistingDGraphContainerId('exited')
      if (exitedContainerId) {
        containerToRemove = exitedContainerId
      }
    }
    if (rmContainer && containerToRemove) {
      await execCommand(`docker rm ${containerToRemove}`)
      logger.debug(`${containerToRemove} removed succesfully`)
    }
  } catch (error) {
    logger.debug('Error while stopping dgraph container')
    logger.debug(error)
  }
}

export const initDgraphContainer = async (): Promise<void> => {
  try {
    await ConfigCommand.load()
    logger.debug(ConfigCommand.dataDir)
    await stopDgraphContainer(true)
    fileUtils.makeDirIfNotExists(path.join(dataDir, testDGraphDirectory))
    await execCommand(
      `docker run -d -p 8995:5080 -p 8996:6080 -p ${testStorageConfig.port}:8080 -p 8998:9080 -p 8999:8000 --label ${
        DGRAPH_CONTAINER_LABEL
      } -v ${dataDir}${testDGraphDirectory}:/dgraph --name dgraph ${DGRAPH_DOCKER_IMAGE_NAME}`
    )
    logger.debug('DGraph instance started!')
    await LaunchCommand.checkIfInstanceIsRunningReportStatus()
  } catch (error) {
    logger.debug('Error while starting dgraph container')
    logger.debug(error)
  }
}

export const getQueryEngineEndpoint = (): string => {
  ServeCommand.config.configDir = configDir
  return `http://localhost:${testQueryEnginePort}/${
    ServeCommand.getCGConfigKey('queryEngine') ?? testQueryEngine
  }`
}
