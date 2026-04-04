import { useContext } from 'react'
import {
  TitanActionsContext,
  TitanCurrentUserContext,
  TitanStateContext,
} from './titan-context'

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

export function useTitanCurrentUser() {
  const currentUser = useContext(TitanCurrentUserContext)

  if (currentUser === null) {
    throw new Error('useTitanCurrentUser must be used within TitanProvider')
  }

  return currentUser
}

export function useTitan() {
  const state = useTitanState()
  const actions = useTitanActions()

  return { state, ...actions }
}
