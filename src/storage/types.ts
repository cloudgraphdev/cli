import {Logger} from 'cloud-graph-sdk'

export interface StorageEngine {
  host: string;
  logger: Logger;
  healthCheck: () => Promise<boolean>;
  setSchema: (schema: string[]) => Promise<void>;
  push: (data: any) => Promise<void>;
}
