import { StorageEngine, StorageEngineConfig } from '@cloudgraph/sdk'
import DgraphEngine from './dgraph'

const engineMap: {
  [key: string]: new (config: StorageEngineConfig) => StorageEngine
} = {
  dgraph: DgraphEngine,
}

export default engineMap
