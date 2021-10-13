import { mergeTypeDefs } from '@graphql-tools/merge'
import { loadFilesSync } from '@graphql-tools/load-files'
import { print } from 'graphql'
import path from 'path'

export const mergeSchemas = (currSchema: string, additions: string[]) => {
  const s = mergeTypeDefs([currSchema, ...additions])
  return print(s)
}

export function getSchemaFromFolder(dirPath: string, provider?: string): any[] {
  return loadFilesSync(path.join(dirPath, provider ? `${provider}*` : ''), {
    extensions: ['graphql'],
  })
}
