export type OfflineOperationType =
  | 'ADD_SPLIT'
  | 'UPDATE_SPLIT'
  | 'DELETE_SPLIT'
  | 'CREATE_GROUP'
  | 'UPDATE_GROUP'
  | 'DELETE_GROUP'
  | 'INGEST_TRANSACTION'
  | 'ADD_CASH_ENTRY'
  | 'ADD_EMI'
  | 'UPDATE_EMI'
  | 'DELETE_EMI'
  | 'TRIGGER_RENT_SPLIT'

export type OfflineOperation = {
  id: string
  type: OfflineOperationType
  entityKey: string
  payload: Record<string, unknown>
  createdAt: number
}
