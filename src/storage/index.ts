import DgraphEngine from './dgraph'
import { StorageEngine, StorageEngineConfig } from './types'

const engineMap: {
  [key: string]: new (config: StorageEngineConfig) => StorageEngine
} = {
  dgraph: DgraphEngine,
}

export default engineMap
