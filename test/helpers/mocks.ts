import { Entity } from '@cloudgraph/sdk'
import path from 'path'
import {
  MockInitCmdFlagsExpectation,
  InitCommandEnums,
  MockInitCmdPromptExpectation,
  MockRunInitCmdPromptExpectation,
  RunInitCommandTestType,
} from './types'

export const rootDir = path.join(__dirname, '../../')
export const rootTestConfigDir = path.join(__dirname, '../../test/.testConfig')
export const testConfigDir = path.join(
  __dirname,
  '../../test/.testConfig/cloudgraph'
)
export const testDataDir = path.join(__dirname, '../../test/.testData')
export const testEndpoint = 'http://localhost:8888'
export const testVersionLimit = '20'
export const testQueryEnginePort = 4444
export const testQueryEngine = 'playground'
export const testStorageEngine = 'dgraph'
export const testDGraphDirectory = '/dgraph'
export const promptForDGraphConfigMockedExpectation = {
  receivedUrl: testEndpoint,
  vLimit: testVersionLimit,
}
export const promptForQueryEngineConfigMockedExpectation = {
  inputQueryEngine: testQueryEngine,
}

const { hostname, port, protocol } = new URL(testEndpoint)
export const testStorageConfig = {
  host: hostname,
  port,
  scheme: protocol.split(':')[0],
}

export const configFileMock = {
  aws: {
    profileApprovedList: ['default'],
    regions: 'us-east-1',
    resources: 'alb',
  },
  cloudGraph: {
    storageConfig: testStorageConfig,
    versionLimit: testVersionLimit,
    queryEngine: testQueryEngine,
    port: testQueryEnginePort,
  },
}

export const askForDGraphConfigFlagsMock = (
  overwriteFlag: boolean
): MockInitCmdFlagsExpectation => ({
  argvList: [`--dgraph=${testEndpoint}`, `--version-limit=${testVersionLimit}`],
  methodToTest: InitCommandEnums.askForDGraphConfig,
  overwriteFlag,
  expectedResult: {
    storageConfig: testStorageConfig,
    versionLimit: testVersionLimit,
  },
})

export const askForQueryEngineConfigFlagsMock = (
  overwriteFlag: boolean
): MockInitCmdFlagsExpectation => ({
  argvList: [`--query-engine=${testQueryEngine}`],
  methodToTest: InitCommandEnums.askForQueryEngineConfig,
  overwriteFlag,
  expectedResult: {
    queryEngine: testQueryEngine,
  },
})

export const getCloudGraphConfigFlagsMock = (
  overwriteFlag: boolean
): MockInitCmdFlagsExpectation => ({
  argvList: [
    ...askForDGraphConfigFlagsMock(overwriteFlag).argvList,
    ...askForQueryEngineConfigFlagsMock(overwriteFlag).argvList,
  ],
  methodToTest: InitCommandEnums.getCloudGraphConfig,
  overwriteFlag,
  expectedResult: {
    ...askForDGraphConfigFlagsMock(overwriteFlag).expectedResult,
    ...askForQueryEngineConfigFlagsMock(overwriteFlag).expectedResult,
  },
})

export const askForDGraphConfigPromptMock = (
  overwriteFlag: boolean
): MockInitCmdPromptExpectation => ({
  methodToTest: InitCommandEnums.askForDGraphConfig,
  overwriteFlag,
  promptExpectation: overwriteFlag
    ? [
        {
          receivedUrl: testEndpoint,
          vLimit: testVersionLimit,
        },
      ]
    : [],
  expectedResult: askForDGraphConfigFlagsMock(overwriteFlag).expectedResult,
})

export const askForQueryEngineConfigPromptMock = (
  overwriteFlag: boolean
): MockInitCmdPromptExpectation => ({
  methodToTest: InitCommandEnums.askForQueryEngineConfig,
  overwriteFlag,
  promptExpectation: overwriteFlag
    ? [
        {
          inputQueryEngine: testQueryEngine,
        },
      ]
    : [],
  expectedResult:
    askForQueryEngineConfigFlagsMock(overwriteFlag).expectedResult,
})

export const fetchCloudGraphConfigFlagsMock = (
  overwriteFlag: boolean
): MockInitCmdFlagsExpectation => ({
  argvList: [
    ...askForDGraphConfigFlagsMock(overwriteFlag).argvList,
    ...askForQueryEngineConfigFlagsMock(overwriteFlag).argvList,
  ],
  methodToTest: InitCommandEnums.getCloudGraphConfig,
  overwriteFlag,
  expectedResult: {
    ...askForDGraphConfigFlagsMock(overwriteFlag).expectedResult,
    ...askForQueryEngineConfigFlagsMock(overwriteFlag).expectedResult,
  },
})

export const fetchCloudGraphConfigPromptMock = (
  overwriteFlag: boolean
): MockInitCmdPromptExpectation => ({
  methodToTest: InitCommandEnums.fetchCloudGraphConfig,
  overwriteFlag,
  promptExpectation: [
    { overwrite: overwriteFlag },
    ...askForDGraphConfigPromptMock(overwriteFlag).promptExpectation,
    ...askForQueryEngineConfigPromptMock(overwriteFlag).promptExpectation,
  ],
  expectedResult: {
    ...askForDGraphConfigPromptMock(overwriteFlag).expectedResult,
    ...askForQueryEngineConfigPromptMock(overwriteFlag).expectedResult,
  },
})

export const runInitCommandMock = (
  overwriteFlags: MockRunInitCmdPromptExpectation['overwriteFlags'],
  test: RunInitCommandTestType
): MockRunInitCmdPromptExpectation => ({
  argvList:
    test === RunInitCommandTestType.flags
      ? fetchCloudGraphConfigFlagsMock(overwriteFlags.overwriteCloudGraphConfig)
          .argvList
      : [],
  overwriteFlags,
  promptExpectation: [
    { overwrite: overwriteFlags.overwriteProviderConfig }, // First prompt for provider config overwrite
    ...fetchCloudGraphConfigPromptMock(overwriteFlags.overwriteCloudGraphConfig)
      .promptExpectation,
  ],
  expectedResult: {
    ...(test === RunInitCommandTestType.flags
      ? fetchCloudGraphConfigFlagsMock(overwriteFlags.overwriteCloudGraphConfig)
          .expectedResult
      : {}),
    ...(test === RunInitCommandTestType.prompt
      ? fetchCloudGraphConfigPromptMock(
          overwriteFlags.overwriteCloudGraphConfig
        ).expectedResult
      : {}),
  },
})

export const addmutationMock =
  (): string =>
'mutation($input:[AddawsApiGatewayResourceInput!]!){addawsApiGatewayResource(input:$input,upsert:true){numUids}}'

export const updatemutationMock =
  (): string =>
'mutation($patch:UpdateawsApiGatewayResourceInput!){updateawsApiGatewayResource(input:$patch){awsApiGatewayResource{id}}}'

export const addmutationMockUsingClassname =
  (): string =>
'mutation($input:[AddawsAPIGatewayResourceInput!]!){addawsAPIGatewayResource(input:$input,upsert:true){numUids}}'

export const mockEntityForMutationTest = {
  className: 'APIGatewayResource',
  name: 'apiGatewayResource',
  mutation: 'mutation($input:[AddawsApiGatewayResourceInput!]!){addawsApiGatewayResource(input:$input,upsert:true){numUids}}',
  data: []
} as Entity

export const mockSchemaMap = {
  'apiGatewayResource': 'apiGatewayResource'
}
