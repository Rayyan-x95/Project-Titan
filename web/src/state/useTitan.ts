import { useContext } from 'react'
import { TitanActionsContext, TitanStateContext } from './titan-context'

export function useTitanState() {
  const state = useContext(TitanStateContext)

  if (!state) {
    throw new Error('useTitanState must be used within TitanProvider')
  }

  return state
}

export function useTitanActions() {
  const actions = useContext(TitanActionsContext)

  if (!actions) {
    throw new Error('useTitanActions must be used within TitanProvider')
  }

  return actions
}

export function useTitan() {
  const state = useTitanState()
  const actions = useTitanActions()

  return { state, ...actions }
}
