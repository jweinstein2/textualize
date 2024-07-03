import { useAppSelector, useAppDispatch } from './store/hooks'
import UpdateElectron from '@/components/update'
import {State} from './AppStateSlice'
import Onboarding from '@/components/onboarding'
import Loading from '@/components/onboarding/loading'
import Shell from '@/components/shell/shell'

function renderAppRoot(param: State) {
    switch(param) {
        case State.NEW:
            return <Onboarding/>;
        case State.LOADING:
            return <Shell/>;
        case State.READY:
            return <Shell/>;
    }
}

function Root() {
    const appState = useAppSelector((state) => state.appState.value)
    return renderAppRoot(appState);
}

export default Root
