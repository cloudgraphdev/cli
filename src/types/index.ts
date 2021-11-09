export interface CloudGraphConfig {
  [key: string]: unknown | Record<NonNullable<string | number>, unknown>
}

export type SchemaMap = {
  [schemaName: string]: string
}
