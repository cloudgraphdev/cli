export enum InitCommandEnums {
  askForDGraphConfig = 'askForDGraphConfig',
  askForQueryEngineConfig = 'askForQueryEngineConfig',
  getCloudGraphConfig = 'getCloudGraphConfig',
  fetchCloudGraphConfig = 'fetchCloudGraphConfig',
  run = 'run',
}

export enum RunInitCommandTestType {
  prompt = 'prompt',
  flags = 'flags',
}

export interface MockInitCmdFlagsExpectation {
  argvList: string[]
  expectedResult: Record<string, any>
  overwriteFlag: boolean
  methodToTest: InitCommandEnums
}

export interface MockInitCmdPromptExpectation {
  methodToTest: InitCommandEnums
  overwriteFlag: boolean
  promptExpectation: any[]
  expectedResult: any
}

export interface MockRunInitCmdPromptExpectation {
  argvList: string[]
  overwriteFlags: {
    overwriteProviderConfig: boolean
    overwriteCloudGraphConfig: boolean
  }
  promptExpectation: any[],
  expectedResult: any
}
