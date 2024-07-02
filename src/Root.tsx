import { useAppSelector, useAppDispatch } from './store/hooks'
import UpdateElectron from '@/components/update'
import {State} from './AppStateSlice'
import Onboarding from '@/components/onboarding'

function renderAppRoot(param: State) {
    switch(param) {
        case State.NEW:
            return <Onboarding/>;
        case State.LOADING:
            return 'loading';
        case State.READY:
            return 'loaded';
    }
}

function Root() {
    const appState = useAppSelector((state) => state.appState.value)

    return (
        <div>
            {renderAppRoot(appState)}
        </div>

    )
}

export default Root
