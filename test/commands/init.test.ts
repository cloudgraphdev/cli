import inquirer from 'inquirer'
import {
  getInitCommand,
  initTestSuite,
  flagTestHelper,
  initCommandArgvGetterMethodTester,
  initCommandPromptGetterMethodTester,
  initCommandNoOverwriteTester,
  runInitCommandTester,
  removeTestDirs,
  saveTestCloudGraphConfigFile,
} from '../helpers'
import {
  askForDGraphConfigFlagsMock,
  askForDGraphConfigPromptMock,
  askForQueryEngineConfigFlagsMock,
  askForQueryEngineConfigPromptMock,
  fetchCloudGraphConfigFlagsMock,
  fetchCloudGraphConfigPromptMock,
  getCloudGraphConfigFlagsMock,
  runInitCommandMock,
  testDGraphDirectory,
  testEndpoint,
  testQueryEngine,
  testQueryEnginePort,
  testStorageEngine,
  testVersionLimit,
} from '../helpers/mocks'
import InitCommandClass from '../../src/commands/init'
import {
  dGraphConfigQuestions,
  overwriteQuestionPrompt,
  queryEngineConfigQuestions,
} from '../../src/utils/questions'
import { RunInitCommandTestType } from '../helpers/types'

initTestSuite({ libsToMock: ['inquirer'] })

describe('Init command', () => {
  let InitCommand: InitCommandClass

  describe('Configuration prompts initial check', () => {
    const inquirerPromptSpy = jest
      .spyOn(inquirer, 'prompt')
      .mockImplementation()
    beforeEach(async () => {
      InitCommand = await getInitCommand([''])
      jest.clearAllMocks()
    })
    afterEach(() => {
      inquirerPromptSpy.mockReset()
    })

    it('should call promptForDGraphConfig', async () => {
      await InitCommand.interface.prompt(dGraphConfigQuestions)
      expect(inquirerPromptSpy).toHaveBeenCalledTimes(1)
      expect(inquirerPromptSpy).toHaveBeenCalledWith(dGraphConfigQuestions)
    })
    it('should call promptForQueryEngineConfig', async () => {
      await InitCommand.interface.prompt(queryEngineConfigQuestions)
      expect(inquirerPromptSpy).toHaveBeenCalledTimes(1)
      expect(inquirerPromptSpy).toHaveBeenCalledWith(queryEngineConfigQuestions)
    })
    it('should call promptForConfigOverwrite', async () => {
      await InitCommand.promptForConfigOverwrite('any')
      expect(inquirerPromptSpy).toHaveBeenCalledTimes(1)
      expect(inquirerPromptSpy).toHaveBeenCalledWith(
        overwriteQuestionPrompt('any')
      )
    })
  })

  describe('Configuration prompt answers parse check', () => {
    const inquirerPromptSpy = jest
      .spyOn(inquirer, 'prompt')
      .mockImplementation()

    describe('Overwrite = true', () => {
      beforeEach(() => {
        inquirerPromptSpy.mockReset()
      })

      it('should call askForDGraphConfig and return the desired configuration', async () => {
        await initCommandPromptGetterMethodTester(
          inquirerPromptSpy,
          askForDGraphConfigPromptMock(true)
        )
      })

      it('should call askForQueryEngineConfig and return the desired configuration', async () => {
        await initCommandPromptGetterMethodTester(
          inquirerPromptSpy,
          askForQueryEngineConfigPromptMock(true)
        )
      })

      it('should call fetchCloudGraphConfig and return the desired configuration(integration test)', async () => {
        InitCommand = await getInitCommand([''])
        await saveTestCloudGraphConfigFile(InitCommand)
        await initCommandPromptGetterMethodTester(
          inquirerPromptSpy,
          fetchCloudGraphConfigPromptMock(true),
          true
        )
      })
    })

    describe('Overwrite = false', () => {
      beforeEach(() => {
        jest.clearAllMocks()
        inquirerPromptSpy.mockReset()
      })

      it('should call askForDGraphConfig and return the desired configuration', async () => {
        await initCommandNoOverwriteTester(askForDGraphConfigPromptMock(false))
      })

      it('should call askForQueryEngineConfig and return the desired configuration', async () => {
        await initCommandNoOverwriteTester(
          askForQueryEngineConfigPromptMock(false)
        )
      })

      it('should call fetchCloudGraphConfig and return the desired configuration(integration test)', async () => {
        inquirerPromptSpy.mockResolvedValueOnce({ overwrite: false })
        await initCommandNoOverwriteTester(
          fetchCloudGraphConfigPromptMock(false)
        )
      })
    })
  })

  describe('Configuration flags parse check (Base class)', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('should set the "--dgraph" flag correctly', async () => {
      await flagTestHelper('dgraph', testEndpoint)
    })
    it('should set the "--version-limit" flag correctly', async () => {
      await flagTestHelper('version-limit', testVersionLimit)
    })
    it('should set the "--port"(queryEngine port) flag correctly', async () => {
      await flagTestHelper('port', testQueryEnginePort)
    })
    it('should set the "--query-engine" flag correctly', async () => {
      await flagTestHelper('query-engine', testQueryEngine)
    })
    it('should set the "--storage" flag correctly', async () => {
      await flagTestHelper('storage', testStorageEngine)
    })
    it('should set the "--dev" flag correctly', async () => {
      await flagTestHelper('dev', undefined)
    })
    it('should set the "--directory" flag correctly', async () => {
      await flagTestHelper('directory', testDGraphDirectory)
    })
    it('should set the "--no-serve" flag correctly', async () => {
      await flagTestHelper('no-serve', undefined)
    })
  })

  describe('Configuration flags parse check (Init class) (overwrite = true)', () => {
    describe('Overwrite = true', () => {
      beforeEach(() => {
        jest.clearAllMocks()
      })
      it('should call askForDGraphConfig and get parsed args', async () => {
        await initCommandArgvGetterMethodTester(
          askForDGraphConfigFlagsMock(true)
        )
      })
      it('should call askForQueryEngineConfig and get parsed args', async () => {
        await initCommandArgvGetterMethodTester(
          askForQueryEngineConfigFlagsMock(true)
        )
      })
      it('should call getCloudGraphConfig and get parsed args(full config)', async () => {
        await initCommandArgvGetterMethodTester(
          getCloudGraphConfigFlagsMock(true)
        )
      })
      it('should call fetchCloudGraphConfig and get parsed args(integration test)', async () => {
        await initCommandArgvGetterMethodTester(
          fetchCloudGraphConfigFlagsMock(true)
        )
      })
    })
    describe('Overwrite = false', () => {
      const inquirerPromptSpy = jest
        .spyOn(inquirer, 'prompt')
        .mockImplementation()
      beforeEach(() => {
        jest.clearAllMocks()
        inquirerPromptSpy.mockReset()
      })

      it('should call askForDGraphConfig and get parsed args', async () => {
        await initCommandNoOverwriteTester(askForDGraphConfigFlagsMock(false))
      })
      it('should call askForQueryEngineConfig and get parsed args', async () => {
        await initCommandNoOverwriteTester(
          askForQueryEngineConfigFlagsMock(false)
        )
      })
      it('should call getCloudGraphConfig and get parsed args(full config)', async () => {
        await initCommandNoOverwriteTester(getCloudGraphConfigFlagsMock(false))
      })
      it('should call fetchCloudGraphConfig and get parsed args(integration test)', async () => {
        inquirerPromptSpy.mockResolvedValueOnce({ overwrite: false })
        await initCommandNoOverwriteTester(
          fetchCloudGraphConfigFlagsMock(false)
        )
      })
    })
  })

  describe('Command test(Full integration test)', () => {
    const inquirerPromptSpy = jest
      .spyOn(inquirer, 'prompt')
      .mockImplementation()
    beforeEach(() => {
      jest.clearAllMocks()
      inquirerPromptSpy.mockReset()
    })
    afterAll(() => {
      removeTestDirs()
    })

    describe('When a config file already exist', () => {
      beforeAll(async () => {
        InitCommand = await getInitCommand([''])
        await saveTestCloudGraphConfigFile(InitCommand)
      })
      it('should run command skipping config overwrite and check that the config file is unchanged', async () => {
        await runInitCommandTester(
          inquirerPromptSpy,
          runInitCommandMock(
            {
              overwriteProviderConfig: false,
              overwriteCloudGraphConfig: false,
            },
            RunInitCommandTestType.prompt
          )
        )
      })
      it('should run command with mocked config prompts and check that the config file is correct', async () => {
        await runInitCommandTester(
          inquirerPromptSpy,
          runInitCommandMock(
            {
              overwriteProviderConfig: false,
              overwriteCloudGraphConfig: true,
            },
            RunInitCommandTestType.prompt
          )
        )
      })
      it('should run command with mocked config flags and check that the config file is correct', async () => {
        await runInitCommandTester(
          inquirerPromptSpy,
          runInitCommandMock(
            {
              overwriteProviderConfig: false,
              overwriteCloudGraphConfig: true,
            },
            RunInitCommandTestType.flags
          )
        )
      })
    })

    describe('First run (no config file)', () => {
      beforeEach(() => {
        jest.clearAllMocks()
        inquirerPromptSpy.mockReset()
      })

      it('should run command with mocked config prompts and check that the config file is correct', async () => {
        await runInitCommandTester(
          inquirerPromptSpy,
          runInitCommandMock(
            {
              overwriteProviderConfig: false,
              overwriteCloudGraphConfig: true,
            },
            RunInitCommandTestType.prompt
          ),
          true
        )
      })
      it('should run command with mocked config flags and check that the config file is correct', async () => {
        await runInitCommandTester(
          inquirerPromptSpy,
          runInitCommandMock(
            {
              overwriteProviderConfig: false,
              overwriteCloudGraphConfig: true,
            },
            RunInitCommandTestType.flags
          ),
          true
        )
      })
    })

    // TODO: Add test with overwriteProviderConfig when tests for BaseCommand and Manager classes are added
  })
})
