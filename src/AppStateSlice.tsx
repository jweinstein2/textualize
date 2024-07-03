import { createSlice } from '@reduxjs/toolkit'

export enum State {
  NEW = 1,
  LOADING,
  READY,
}

export interface AppState {
    value: State,
    source: string,
    analysisProgress: number,
}

const initialState: AppState = {
    value: State.NEW,
    source: '',
    analysisProgress: 0,
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
