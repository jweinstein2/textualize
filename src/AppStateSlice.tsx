import { createSlice } from '@reduxjs/toolkit'

export enum State {
  NEW = 1,
  LOADING,
  READY,
}

export interface AppState {
    value: State,
    source: string,
}

// Define the initial state using that type
const initialState: AppState = {
    value: State.NEW,
    source: ''
}

export const appStateSlice = createSlice({
    name: 'appState',
    initialState,
    reducers: {
        completeOnboarding: (state, action) => {
            state.source = action.payload
            state.value = State.LOADING
        },
    },
})

export const { completeOnboarding } = appStateSlice.actions


export default appStateSlice.reducer
