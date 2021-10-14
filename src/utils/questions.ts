import { ConfirmQuestion, ListQuestion, InputQuestion } from 'inquirer'
import { getDefaultEndpoint } from '.'

export const overwriteQuestionPrompt = (
  category: string
): ConfirmQuestion[] => [
  {
    type: 'confirm',
    message: `Would you like to change ${category} config`,
    name: 'overwrite',
    default: true,
  },
]

export const getProviderQuestion: ListQuestion[] = [
  {
    type: 'list',
    name: 'provider',
    message: 'Which cloud provider would you like to use?',
    choices: ['aws'],
  },
]

export const getPolicyPackQuestion: ListQuestion[] = [
  {
    type: 'list',
    name: 'policyPack',
    message: 'Which Policy Pack would you like to use?',
    choices: ['aws-demo'],
  },
]

export const dGraphConfigQuestions: InputQuestion[] = [
  {
    type: 'input',
    message:
      'Input your dgraph host url, if you are unsure, use the default by pressing ENTER',
    name: 'receivedUrl',
    default: getDefaultEndpoint(),
  },
  {
    type: 'input',
    message:
      'Enter the maximum number of scanned versions of your cloud data that you would like to store',
    name: 'vLimit',
    default: 10,
  },
]

export const queryEngineConfigQuestions: ListQuestion[] = [
  {
    type: 'list',
    message: 'What tool would you like to query your data with?',
    name: 'inputQueryEngine',
    choices: [
      {
        name: 'GraphQL Playground (https://github.com/graphql/graphql-playground)',
        value: 'playground',
        short: 'GraphQL Playground',
      },
      {
        name: 'Altair GraphQL Client (https://altair.sirmuel.design/)',
        value: 'altair',
        short: 'Altair GraphQL Client',
      },
    ],
    default: 'playground',
  },
]
